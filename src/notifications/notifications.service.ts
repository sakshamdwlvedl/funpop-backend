import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as webpush from 'web-push';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PushSubscription } from './schemas/push-subscription.schema';
import { UserInteractionService } from '../user-interaction/user-interaction.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly publicVapidKey =
    'BF8zHB_4FdRgv_vZYWQeyzj0GxiJ7Na0iPvpcX0ARvYX6tys_E8Y178rs-hv351uL_e9RTFE0Hdh6mJbxhwF4jQ';
  private readonly privateVapidKey =
    'p0Y1qJ8bD84FzQ2tPueE3s2ck-QzQaGpKha_nNXULxA';

  constructor(
    @InjectModel(PushSubscription.name)
    private subscriptionModel: Model<PushSubscription>,
    private userInteractionService: UserInteractionService,
  ) {}

  onModuleInit() {
    webpush.setVapidDetails(
      'mailto:admin@funpop.com',
      this.publicVapidKey,
      this.privateVapidKey,
    );
  }

  async subscribe(subscription: any, userId?: string) {
    this.logger.log(`New subscription: ${subscription.endpoint}`);
    return this.subscriptionModel.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      { ...subscription, userId, active: true },
      { upsert: true, new: true },
    );
  }

  async unsubscribe(endpoint: string) {
    return this.subscriptionModel.findOneAndUpdate(
      { endpoint },
      { active: false },
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async sendDailyNotifications() {
    this.logger.log('Sending daily notifications...');
    const subscriptions = await this.subscriptionModel.find({ active: true });

    for (const sub of subscriptions) {
      // 1. New movies/series notification
      await this.sendPush(sub, {
        title: 'New on FunPop!',
        body: 'Check out the latest movies and series added today.',
        icon: '/assets/icons/icon-72x72.png',
        data: { url: '/dashboard' },
      });

      // 2. Wishlist reminder
      if (sub.userId) {
        const wishlist = await this.userInteractionService.getWishlist(
          sub.userId,
        );
        if (wishlist && wishlist.length > 0) {
          const randomItem =
            wishlist[Math.floor(Math.random() * wishlist.length)];

          await this.sendPush(sub, {
            title: 'Ready to watch?',
            body: `Don't forget to watch ${randomItem.title} from your wishlist!`,
            icon: '/assets/icons/icon-72x72.png',
            data: {
              url: `/detail/${randomItem.mediaType}/${randomItem.mediaId}`,
            },
          });
        }
      }
    }
  }

  private async sendPush(subscription: any, payload: any) {
    try {
      const pushPayload = {
        notification: {
          title: payload?.title || 'Notification',
          body: payload?.body || 'You have a new message',
          icon: '/assets/icons/icon-192x192.png',
          badge: '/assets/icons/icon-72x72.png',
          data: payload?.data || {},
        },
      };

      await webpush.sendNotification(
        subscription,
        JSON.stringify(pushPayload),
        {
          TTL: 60,
          urgency: 'high',
        },
      );
    } catch (error: any) {
      this.logger.error(`Push Error: ${error?.message || error}`);

      if (error?.statusCode === 404 || error?.statusCode === 410) {
        await this.subscriptionModel.deleteOne({
          endpoint: subscription.endpoint,
        });
      }
    }
  }

  getPublicKey() {
    return this.publicVapidKey;
  }
}

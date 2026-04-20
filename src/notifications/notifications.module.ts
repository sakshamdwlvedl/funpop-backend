import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PushSubscription, PushSubscriptionSchema } from './schemas/push-subscription.schema';
import { UserInteractionModule } from '../user-interaction/user-interaction.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PushSubscription.name, schema: PushSubscriptionSchema }]),
    UserInteractionModule,
  ],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}

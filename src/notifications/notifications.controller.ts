import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('subscribe')
  async subscribe(@Body() body: { subscription: any, userId?: string }) {
    return this.notificationsService.subscribe(body.subscription, body.userId);
  }

  @Post('unsubscribe')
  async unsubscribe(@Body() body: { endpoint: string }) {
    return this.notificationsService.unsubscribe(body.endpoint);
  }

  @Get('vapid-public-key')
  getVapidPublicKey() {
    return { publicKey: this.notificationsService.getPublicKey() };
  }

  @Post('send-test')
  async sendTestNotification() {
    await this.notificationsService.sendDailyNotifications();
    return { message: 'Test notifications triggered' };
  }
}

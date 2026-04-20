import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PushSubscription extends Document {
  @Prop({ required: true, unique: true })
  endpoint: string;

  @Prop({ type: Object, required: true })
  keys: {
    p256dh: string;
    auth: string;
  };

  @Prop()
  userId?: string;

  @Prop({ default: true })
  active: boolean;
}

export const PushSubscriptionSchema = SchemaFactory.createForClass(PushSubscription);

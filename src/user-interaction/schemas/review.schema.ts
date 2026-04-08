import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Review extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  mediaId: string;

  @Prop({ required: true })
  mediaType: string;

  @Prop({ required: true, min: 1, max: 10 })
  rating: number;

  @Prop({ required: true })
  review: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ userId: 1, mediaId: 1, mediaType: 1 }, { unique: true });

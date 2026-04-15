import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Wishlist extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  mediaId: string;

  @Prop({ required: true })
  mediaType: string;

  @Prop()
  title: string;

  @Prop()
  posterPath: string;

  @Prop()
  voteAverage: number;

  @Prop()
  releaseDate: string;

  @Prop({ default: 0 })
  order: number;
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);
WishlistSchema.index({ userId: 1, mediaId: 1, mediaType: 1 }, { unique: true });

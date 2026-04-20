import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserInteractionController } from './user-interaction.controller';
import { UserInteractionService } from './user-interaction.service';
import { Wishlist, WishlistSchema } from './schemas/wishlist.schema';
import { Favorite, FavoriteSchema } from './schemas/favorite.schema';
import { Review, ReviewSchema } from './schemas/review.schema';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wishlist.name, schema: WishlistSchema },
      { name: Favorite.name, schema: FavoriteSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [UserInteractionController],
  providers: [UserInteractionService],
  exports: [UserInteractionService],
})
export class UserInteractionModule {}

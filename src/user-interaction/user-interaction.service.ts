import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wishlist } from './schemas/wishlist.schema';
import { Favorite } from './schemas/favorite.schema';
import { Review } from './schemas/review.schema';
import { User } from './schemas/user.schema';
import {
  ToggleWishlistDto,
  ToggleFavoriteDto,
  CreateReviewDto,
} from './dto/interaction.dto';

@Injectable()
export class UserInteractionService implements OnModuleInit {
  constructor(
    @InjectModel(Wishlist.name) private wishlistModel: Model<Wishlist>,
    @InjectModel(Favorite.name) private favoriteModel: Model<Favorite>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultUser();
  }

  async seedDefaultUser() {
    const defaultUserId = 'funpop_user_123';
    const defaultUsername = 'FunPop User';

    const existing = await this.userModel.findOne({ userId: defaultUserId });
    if (!existing) {
      await this.userModel.create({
        userId: defaultUserId,
        username: defaultUsername,
      });
      console.log(`Default user ${defaultUserId} created.`);
    }
  }

  async toggleWishlist(dto: ToggleWishlistDto) {
    const existing = await this.wishlistModel.findOne({
      userId: dto.userId,
      mediaId: dto.mediaId,
      mediaType: dto.mediaType,
    });

    if (existing) {
      await this.wishlistModel.deleteOne({ _id: existing._id });
      return { added: false };
    } else {
      const maxItem = await this.wishlistModel
        .findOne({ userId: dto.userId })
        .sort({ order: -1 });
      const order = maxItem ? maxItem.order + 1 : 0;
      const newItem = new this.wishlistModel({ ...dto, order });
      await newItem.save();
      return { added: true };
    }
  }

  async getWishlist(userId: string, mediaType?: string) {
    const query: any = { userId };
    if (mediaType) query.mediaType = mediaType;
    return this.wishlistModel
      .find(query)
      .sort({ order: 1, createdAt: -1 })
      .exec();
  }

  async updateWishlistOrder(userId: string, mediaIds: string[]) {
    const bulkOps = mediaIds.map((mediaId, index) => ({
      updateOne: {
        filter: { userId, mediaId },
        update: { $set: { order: index } },
      },
    }));
    return this.wishlistModel.bulkWrite(bulkOps);
  }

  async toggleFavorite(dto: ToggleFavoriteDto) {
    const existing = await this.favoriteModel.findOne({
      userId: dto.userId,
      mediaId: dto.mediaId,
      mediaType: dto.mediaType,
    });

    if (existing) {
      await this.favoriteModel.deleteOne({ _id: existing._id });
      return { added: false };
    } else {
      const maxItem = await this.favoriteModel
        .findOne({ userId: dto.userId })
        .sort({ order: -1 });
      const order = maxItem ? maxItem.order + 1 : 0;
      const newItem = new this.favoriteModel({ ...dto, order });
      await newItem.save();
      return { added: true };
    }
  }

  async getFavorites(userId: string, mediaType?: string) {
    const query: any = { userId };
    if (mediaType) query.mediaType = mediaType;
    return this.favoriteModel
      .find(query)
      .sort({ order: 1, createdAt: -1 })
      .exec();
  }

  async addReview(dto: CreateReviewDto) {
    const existing = await this.reviewModel.findOne({
      userId: dto.userId,
      mediaId: dto.mediaId,
      mediaType: dto.mediaType,
    });

    if (existing) {
      existing.rating = dto.rating;
      existing.review = dto.review;
      existing.username = dto.username;
      return existing.save();
    } else {
      const newReview = new this.reviewModel(dto);
      return newReview.save();
    }
  }

  async getReviews(mediaType: string, mediaId: string) {
    return this.reviewModel
      .find({ mediaType, mediaId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getInteractionStatus(
    userId: string,
    mediaType: string,
    mediaId: string,
  ) {
    const [wishlist, favorite, review] = await Promise.all([
      this.wishlistModel.findOne({ userId, mediaId, mediaType }),
      this.favoriteModel.findOne({ userId, mediaId, mediaType }),
      this.reviewModel.findOne({ userId, mediaId, mediaType }),
    ]);

    return {
      inWishlist: !!wishlist,
      inFavorites: !!favorite,
      userReview: review || null,
    };
  }
}

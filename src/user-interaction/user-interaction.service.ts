import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wishlist } from './schemas/wishlist.schema';
import { Favorite } from './schemas/favorite.schema';
import { Review } from './schemas/review.schema';
import { ToggleWishlistDto, ToggleFavoriteDto, CreateReviewDto } from './dto/interaction.dto';

@Injectable()
export class UserInteractionService {
  constructor(
    @InjectModel(Wishlist.name) private wishlistModel: Model<Wishlist>,
    @InjectModel(Favorite.name) private favoriteModel: Model<Favorite>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
  ) {}

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
      const newItem = new this.wishlistModel(dto);
      await newItem.save();
      return { added: true };
    }
  }

  async getWishlist(userId: string) {
    return this.wishlistModel.find({ userId }).sort({ createdAt: -1 }).exec();
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
      const newItem = new this.favoriteModel(dto);
      await newItem.save();
      return { added: true };
    }
  }

  async getFavorites(userId: string) {
    return this.favoriteModel.find({ userId }).sort({ createdAt: -1 }).exec();
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
    return this.reviewModel.find({ mediaType, mediaId }).sort({ createdAt: -1 }).exec();
  }

  async getInteractionStatus(userId: string, mediaType: string, mediaId: string) {
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

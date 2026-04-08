import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { UserInteractionService } from './user-interaction.service';
import { ToggleWishlistDto, ToggleFavoriteDto, CreateReviewDto } from './dto/interaction.dto';

@Controller('interactions')
export class UserInteractionController {
  constructor(private readonly service: UserInteractionService) {}

  @Post('wishlist')
  toggleWishlist(@Body() dto: ToggleWishlistDto) {
    return this.service.toggleWishlist(dto);
  }

  @Get('wishlist/:userId')
  getWishlist(@Param('userId') userId: string) {
    return this.service.getWishlist(userId);
  }

  @Post('favorites')
  toggleFavorite(@Body() dto: ToggleFavoriteDto) {
    return this.service.toggleFavorite(dto);
  }

  @Get('favorites/:userId')
  getFavorites(@Param('userId') userId: string) {
    return this.service.getFavorites(userId);
  }

  @Post('reviews')
  addReview(@Body() dto: CreateReviewDto) {
    return this.service.addReview(dto);
  }

  @Get('reviews/:mediaType/:mediaId')
  getReviews(@Param('mediaType') mediaType: string, @Param('mediaId') mediaId: string) {
    return this.service.getReviews(mediaType, mediaId);
  }

  @Get('status')
  getStatus(
    @Query('userId') userId: string,
    @Query('mediaType') mediaType: string,
    @Query('mediaId') mediaId: string,
  ) {
    return this.service.getInteractionStatus(userId, mediaType, mediaId);
  }
}

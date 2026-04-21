import { Controller, Post, Get, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserInteractionService } from './user-interaction.service';
import {
  ToggleWishlistDto,
  ToggleFavoriteDto,
  CreateReviewDto,
} from './dto/interaction.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('interactions')
export class UserInteractionController {
  constructor(private readonly service: UserInteractionService) {}

  @Post('wishlist/reorder')
  reorderWishlist(
    @Req() req: any,
    @Body() body: { mediaIds: string[]; mediaType: string },
  ) {
    return this.service.updateWishlistOrder(
      req.user.userId,
      body.mediaIds,
      body.mediaType,
    );
  }

  @Post('favorites/reorder')
  reorderFavorite(
    @Req() req: any,
    @Body() body: { mediaIds: string[]; mediaType: string },
  ) {
    return this.service.updateFavoriteOrder(
      req.user.userId,
      body.mediaIds,
      body.mediaType,
    );
  }

  @Post('wishlist')
  toggleWishlist(@Req() req: any, @Body() dto: ToggleWishlistDto) {
    dto.userId = req.user.userId;
    return this.service.toggleWishlist(dto);
  }

  @Get('wishlist')
  getWishlist(@Req() req: any, @Query('mediaType') mediaType?: string) {
    return this.service.getWishlist(req.user.userId, mediaType);
  }

  @Post('favorites')
  toggleFavorite(@Req() req: any, @Body() dto: ToggleFavoriteDto) {
    dto.userId = req.user.userId;
    return this.service.toggleFavorite(dto);
  }

  @Get('favorites')
  getFavorites(@Req() req: any, @Query('mediaType') mediaType?: string) {
    return this.service.getFavorites(req.user.userId, mediaType);
  }

  @Post('reviews')
  addReview(@Req() req: any, @Body() dto: CreateReviewDto) {
    dto.userId = req.user.userId;
    dto.username = req.user.username || 'Anonymous';
    return this.service.addReview(dto);
  }

  @Get('reviews/:mediaType/:mediaId')
  getReviews(
    @Param('mediaType') mediaType: string,
    @Param('mediaId') mediaId: string,
  ) {
    return this.service.getReviews(mediaType, mediaId);
  }

  @Get('status')
  getStatus(
    @Req() req: any,
    @Query('mediaType') mediaType: string,
    @Query('mediaId') mediaId: string,
  ) {
    return this.service.getInteractionStatus(
      req.user.userId,
      mediaType,
      mediaId,
    );
  }
}

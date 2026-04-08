import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class ToggleWishlistDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  mediaId: string;

  @IsString()
  @IsNotEmpty()
  mediaType: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  posterPath?: string;

  @IsNumber()
  @IsOptional()
  voteAverage?: number;

  @IsString()
  @IsOptional()
  releaseDate?: string;
}

export class ToggleFavoriteDto extends ToggleWishlistDto {}

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  mediaId: string;

  @IsString()
  @IsNotEmpty()
  mediaType: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  rating: number;

  @IsString()
  @IsNotEmpty()
  review: string;
}

import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../user-interaction/schemas/user.schema';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = dto.password ? await bcrypt.hash(dto.password, 10) : undefined;
    
    // Generate a unique userId if not provided (like funpop_user_random)
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);

    const user = new this.userModel({
      ...dto,
      password: hashedPassword,
      userId,
    });

    await user.save();
    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password!, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user);
  }

  async googleLogin(req: any) {
    if (!req.user) {
      throw new UnauthorizedException('No user from google');
    }

    const { emails, displayName, photos, id } = req.user;
    const email = emails[0].value;

    let user = await this.userModel.findOne({ email });

    if (!user) {
      const userId = 'user_google_' + id;
      user = new this.userModel({
        email,
        username: displayName,
        avatar: photos[0]?.value,
        googleId: id,
        userId,
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = id;
      if (!user.avatar) user.avatar = photos[0]?.value;
      await user.save();
    }

    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = { email: user.email, sub: user.userId, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        userId: user.userId,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      },
    };
  }
}

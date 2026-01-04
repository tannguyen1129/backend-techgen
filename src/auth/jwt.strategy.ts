import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');

    // Kiểm tra và báo lỗi nếu SECRET chưa được thiết lập
    if (!secret) {
        throw new UnauthorizedException('JWT_SECRET not configured.');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
      ignoreExpiration: false, 
      // Ép kiểu đảm bảo nó là string
      secretOrKey: secret, 
    });
  }

  async validate(payload: any) {
    // Logic xác thực đơn giản: Trả về user info từ payload
    return { userId: payload.sub, username: payload.username }; 
  }
}
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity'; // <-- Đã fix đường dẫn Entity
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy'; // <-- Thư viện xác thực

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    ConfigModule, // Cần có ConfigModule để lấy JWT_SECRET
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // <-- Đăng ký JwtStrategy
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
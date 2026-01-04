import { Controller, Post, Body, UnauthorizedException, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { AuthGuard } from '@nestjs/passport'; // Cần thiết cho các API bảo vệ

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    const result = await this.authService.login(body);
    
    if (!result) {
        throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');
    }
    
    // Trả về access_token cho Frontend
    return result; 
  }
  
  // (Optional) Endpoint test xác thực
  // @UseGuards(AuthGuard('jwt')) 
  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user;
  // }
}
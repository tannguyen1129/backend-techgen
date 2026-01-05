import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express'; // 1. IMPORT QUAN TRỌNG

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. Cấu hình tiền tố API (URL sẽ là localhost:4000/api/...)
  app.setGlobalPrefix('api');

  // 3. Tăng giới hạn Upload (Bắt buộc để nhận ảnh > 1MB)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // 4. Bật CORS để Frontend gọi được
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://techgen.umt.edu.vn', 'http://localhost:3000'] // Danh sách domain được phép gọi API
      : true, // Dev thì cho phép tất cả
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  await app.listen(process.env.PORT || 4000, '0.0.0.0');
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
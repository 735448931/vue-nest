import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}

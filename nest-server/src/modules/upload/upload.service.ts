import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class UploadService {
  @InjectRepository(User)
  private userRepository: Repository<User>;

  // 更新用户头像
    async updateUserAvatar(userId: number, avatarUrl: string) {
              
    await this.userRepository.update(userId, {
      headPic: avatarUrl
    });
    return { success: true, message: '头像更新成功' };
  }
}

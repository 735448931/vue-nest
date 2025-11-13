import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/enum/common.enum';

@Injectable()
export class RedisService implements OnModuleDestroy {

  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  getClient(): Redis {
    return this.client;
  }

  RedisClient = this.getClient();


  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(key, value, 'EX', ttlSeconds);
      return;
    }
    await this.client.set(key, value);
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async del(key: string) {
    return this.client.del(key);
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
    } catch (error) {
      
    }
  }
}

import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from 'src/enum/common.enum';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    RedisService,
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST') ?? '127.0.0.1';
        const portValue = configService.get('REDIS_PORT');
        const dbValue = configService.get('REDIS_DB');
        const password = configService.get<string>('REDIS_PASSWORD');

        const parsedPort = Number(portValue ?? 6379);
        const parsedDb = Number(dbValue ?? 0);

        const client = new Redis({
          host,
          port: Number.isFinite(parsedPort) ? parsedPort : 6379,
          password: password || undefined,
          db: Number.isFinite(parsedDb) ? parsedDb : 0,
        });

        client.on('error', (error) => {
          // Log connection issues so they surface during development
          console.error('[Redis] connection error', error);
        });

        return client;
      },
    },
  ],
  exports: [RedisService, REDIS_CLIENT],
})
export class RedisModule {}

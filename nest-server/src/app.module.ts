import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UploadModule } from './modules/upload/upload.module';
import { UserModule } from './modules/user/user.module';
import { WinstonLogger,WinstonModule,utilities } from 'nest-winston';
import * as winston from 'winston';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/user/entities/user.entity';
import { CityModule } from './modules/city/city.module';
import { City } from './modules/city/entities/city.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Permission } from './modules/user/entities/permission.entity';
import { Role } from './modules/user/entities/role.entity';
// import { LoginGuard } from './login.guard';
// import { PermissionGuard } from './permission.guard';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RequestLogInterceptor } from './interceptor/request-log.interceptor';
import { RedisModule } from './modules/redis/redis.module';
import { EmailModule } from './modules/email/email.module';
import { HttpModule } from '@nestjs/axios';
import { LangchainModule } from './modules/langchain/langchain.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
	imports: [
		HttpModule.register({
			timeout: 5000,
		}),
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath:'src/.env.development'
		}),
		UploadModule,
		UserModule,
		WinstonModule.forRootAsync({
			useFactory: () => ({
				level: 'debug',
				transports: [
					// new winston.transports.File({
					// 	filename: `${process.cwd()}/log`
					// }),
					new winston.transports.Console({
						format: winston.format.combine(
							winston.format.timestamp(),
							utilities.format.nestLike()
						)
					})
				]
			})
		}),
		TypeOrmModule.forRoot({
			type: 'mysql',
			host: 'localhost',
			port: 3306,
			username: 'root',
			password: 'haoxuan',
			database: 'nest-server',
			synchronize: true,
			logging: true,
			entities: [User, City, Role, Permission],
			poolSize: 10,
			connectorPackage: 'mysql2',
			extra: {
				authPlugin: 'sha256_password'
			}
		}),
		JwtModule.register({
			global: true,
			secret: 'mySecretKey',
			signOptions: { expiresIn: '7d' }
		}),
		RedisModule,
		CityModule,
		EmailModule,
		LangchainModule,
		ChatModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		// {
		// 	provide: APP_GUARD,
		// 	useClass: LoginGuard
		// },
		// {
		// 	provide: APP_GUARD,
		// 	useClass: PermissionGuard
		// },
		// {
		// 	provide: APP_INTERCEPTOR,
		// 	useClass: RequestLogInterceptor
		// }
	]
})
export class AppModule {}

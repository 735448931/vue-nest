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

@Module({
	imports: [
		ConfigModule.forRoot(),
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
			database: 'mysql-test',
			synchronize: true,
			logging: true,
			entities: [User,City],
			poolSize: 10,
			connectorPackage: 'mysql2',
			extra: {
				authPlugin: 'sha256_password'
			}
		}),
		CityModule
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}

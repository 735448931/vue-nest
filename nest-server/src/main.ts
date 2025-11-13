import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { HttpExceptionFilter } from './filter/http-exception.filter'
import { ValidationPipe } from '@nestjs/common'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { FormatResponseInterceptor } from './interceptor/response.interceptor'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  
	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.REDIS,
		options: {
			host: 'localhost',
			port: 6379
		}
	})
	// 允许跨域
  app.enableCors()
  
	// 设置全局路由前缀
	app.setGlobalPrefix('api')

	// 设置全局异常过滤器
	app.useGlobalFilters(new HttpExceptionFilter())

	// 设置响应拦截器 统一返回格式
	app.useGlobalInterceptors(new FormatResponseInterceptor())

	app.useGlobalPipes(new ValidationPipe({ transform: true }))

	app.useStaticAssets('public', { prefix: '/static' })

	app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
	await app.startAllMicroservices()
	await app.listen(process.env.PORT ?? 3000)
}
bootstrap()

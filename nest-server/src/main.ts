import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { HttpFilter } from './shared/globa-http.filter'
import { ValidationPipe } from '@nestjs/common'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: 'localhost',
      port: 6379
    }
  })
  app.enableCors()
  app.setGlobalPrefix('api')
  app.useGlobalFilters(new HttpFilter())
  app.useGlobalPipes(new ValidationPipe({transform:true}))

  app.useStaticAssets('public', { prefix: '/static' })
  
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
  await app.startAllMicroservices()
	await app.listen(process.env.PORT ?? 3000)
}
bootstrap()

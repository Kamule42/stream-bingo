import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import fastifyCookie from '@fastify/cookie'
import fastifyCsrf from '@fastify/csrf-protection'
import helmet from '@fastify/helmet'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { ConfigService } from '@nestjs/config'
import { cspPolicy } from './config/csp'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())
  const config = app.get<ConfigService>(ConfigService)
  await app.register(fastifyCookie, {
    secret: config.get('cookie.secret') as string, // for cookies signature
  })
  await app.register(fastifyCsrf)
  await app.register(helmet, {
    contentSecurityPolicy: cspPolicy
  })
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap();

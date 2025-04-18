import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import fastifyCookie from '@fastify/cookie'
import fastifyCsrf from '@fastify/csrf-protection'
import helmet from '@fastify/helmet'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { ConfigService } from '@nestjs/config'
import { cspPolicy } from './config/csp'

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter()
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter)
  const config = app.get<ConfigService>(ConfigService)
  await app.register(fastifyCookie, {
    secret: config.get('cookie.secret') as string, // for cookies signature
  })
  await app.register(fastifyCsrf, { cookieOpts: { signed: true } })
  await app.register(helmet, {
    contentSecurityPolicy: cspPolicy
  })
  fastifyAdapter.getInstance().addHook('onRequest', (request: any, reply: any, done) => {
    reply.setHeader = function (key, value) {
      return this.raw.setHeader(key, value)
    }
    reply.end = function () {
      this.raw.end()
    }
    request.res = reply
    done()
  })
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap();

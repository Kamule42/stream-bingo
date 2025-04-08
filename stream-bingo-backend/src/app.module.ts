import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AppController } from './app.controller'
import { UserModule } from './user/user.module'
import configuration from './config/configuration'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StreamModule } from './stream/stream.module'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { AuthGuard } from './shared/guards/auth/auth.guard'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('db.host') ?? 'localhost',
        port: configService.get<number>('db.port') ?? 5432,
        username: configService.get<string>('db.username') ?? 'root',
        password: configService.get<string>('db.password') ?? 'pwd',
        database: configService.get<string>('db.database') ?? 'bingo',
        synchronize: false,
        autoLoadEntities: true,
      }),
    }),
    UserModule,
    StreamModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}

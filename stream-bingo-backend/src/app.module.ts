import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import configuration from './config/configuration'
import { TypeOrmModule } from '@nestjs/typeorm'

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
        type: 'mariadb',
        host: configService.get<string>('db.host') ?? 'localhost',
        port: configService.get<number>('db.port') ?? 3306,
        username: configService.get<string>('db.username') ?? 'root',
        password: configService.get<string>('db.password') ?? 'pwd',
        database: configService.get<string>('db.database') ?? 'bingo',
        entities: [],
        synchronize: false,
      }),
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

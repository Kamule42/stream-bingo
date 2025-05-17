import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthService } from './services/auth/auth.service'
import { AuthController } from './controllers/auth/auth.controller'
import { HttpModule } from '@nestjs/axios'
import { UserEntity } from './entities/user.entity'
import { RightEntity } from './entities/right.entity'
import { UserGateway } from './gateways/user/user.gateway'
import { UserService } from './services/user/user/user.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { DiscordStrategy } from './services/passport/discord-strategy/discord-strategy.service'
import { JwtStrategy } from './services/passport/jwt-strategy/jwt-strategy.service'
import { AuthGateway } from './gateways/auth/auth.gateway';
import { ProviderEntity } from './entities/provider.entity'
import { GoogleStrategyService } from './services/passport/google-strategy/google-strategy.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([ UserEntity, RightEntity, ProviderEntity ]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('jwt.secret') ?? 'secret',
        signOptions: { expiresIn: 70 },
      }),
    }),
  ],
  providers: [AuthService, UserGateway, UserService, DiscordStrategy, JwtStrategy, AuthGateway, GoogleStrategyService, ],
  exports: [ AuthService ],
  controllers: [AuthController],
})
export class UserModule {}

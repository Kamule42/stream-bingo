import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthService } from './services/auth/auth.service'
import { AuthController } from './controllers/auth/auth.controller'
import { HttpModule } from '@nestjs/axios'
import { UserEntity } from './entities/user.entity'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { RightEntity } from './entities/rights.entity'
import { UserGateway } from './gateways/user/user.gateway'

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([ UserEntity, RightEntity, ]),
    JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      global: true,
      secret: configService.get<string>('jwt.secret') ?? 'secret',
      signOptions: { expiresIn: '60m' },
    })
  }),],
  providers: [AuthService, UserGateway],
  exports: [ AuthService ],
  controllers: [AuthController],
})
export class UserModule {}

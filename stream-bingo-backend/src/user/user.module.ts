import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { HttpModule } from '@nestjs/axios';
import { UserEntity } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([UserEntity]), JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      global: true,
      secret:  configService.get<string>('jwt.secret') ?? 'secret',
      signOptions: { expiresIn: '60s' },
    })
  }),],
  providers: [AuthService],
  controllers: [AuthController],
})
export class UserModule {}

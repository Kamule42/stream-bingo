import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import Strategy from 'passport-google-oauth20'
import { ISession } from 'src/user/interfaces/session.interface'
import { AuthService } from '../../auth/auth.service'
import { PassportData } from 'src/user/interfaces/passport-data.interface'

@Injectable()
export class GoogleStrategyService extends PassportStrategy(Strategy) {

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('google.client_id') ?? '',
      clientSecret: configService.get<string>('google.client_secret') ?? '',
      callbackURL: configService.get<string>('google.target_uri') ?? '',
      scope: ['profile']
    })
  }

  async validate(token, _, data): Promise<ISession> {
    return this.authService.validatePassport('google', {
      id: data.id,
      username: data.displayName,
      avatar: data.photos.at(0)?.value ?? 'none',
    })
  }
}

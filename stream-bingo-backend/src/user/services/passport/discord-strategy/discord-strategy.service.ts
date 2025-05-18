import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import Strategy from 'passport-discord'
import { ISession } from 'src/user/interfaces/session.interface'
import { AuthService } from '../../auth/auth.service'
import { PassportData } from 'src/user/interfaces/passport-data.interface'

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy) {

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('discord.client_id') ?? '',
      clientSecret: configService.get<string>('discord.client_secret') ?? '',
      callbackURL: configService.get<string>('discord.target_uri') ?? '',
      scope: ['identify']
    })
  }

  async validate(accessToken, _, data: PassportData): Promise<ISession> {
    return this.authService.validatePassport('discord', data)
  }

}

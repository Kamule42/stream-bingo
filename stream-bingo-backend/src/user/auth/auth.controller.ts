import { Body, Controller, Get, Post, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { map, Observable, tap } from 'rxjs'
import { FastifyReply } from 'fastify'
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('discord-url')
  public getDiscordUrl(): { url: string } {
    return {
      url: this.authService.getAuthUrl(),
    };
  }

  @Post('discord-validate')
  public discordRedirect(
    @Body() {code}: {code: string},
    @Res({ passthrough: true }) response: FastifyReply
  ): Observable<{access_token: string}> {
    return this.authService.validateDiscord(code).pipe(
      tap(result => response.setCookie('identity', result.user_id, {
        path: '/',
        signed: true,
        httpOnly: true,
        secure: true,
        sameSite: true,
      })),
      map(({access_token}) => ({access_token})),
    )
  }
}

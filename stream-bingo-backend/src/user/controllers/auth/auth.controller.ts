import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common'
import { AuthService } from '../../services/auth/auth.service'
import { map, Observable, tap } from 'rxjs'
import { FastifyReply } from 'fastify'
import { DateTime } from 'luxon'
import { AuthGuard } from '@nestjs/passport'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}


  @Get('logout')
  public logout(@Res({ passthrough: true }) response: FastifyReply) {
    response.clearCookie('refresh_token')
  }

  @Get('discord-url')
  public getDiscordUrl(): { url: string } {
    return {
      url: this.authService.getAuthUrl(),
    };
  }

  @UseGuards(
    AuthGuard('discord')
  )
  @Get('discord')
  public loginWithDiscord(){}

  @Post('discord-validate')
  public discordRedirect(
    @Body() {code}: {code: string},
    @Res({ passthrough: true }) response: FastifyReply
  ): Observable<{access_token: string}> {
    return this.authService.validateDiscord(code).pipe(
      tap(result => {
        const expires = DateTime.now().plus({week: 4}).endOf('day').toJSDate()
        response.setCookie(
          'refresh_token',
          JSON.stringify({
            sub: result.user_id,
            expires
          }),
          {
            path: '/',
            signed: true,
            httpOnly: true,
            secure: true,
            sameSite: true,
            expires
          })
      }),
      map(({access_token}) => ({access_token})),
    )
  }
}

import { Controller, Get, Request, Res, UseGuards } from '@nestjs/common'
import { AuthService } from '../../services/auth/auth.service'
import { FastifyReply } from 'fastify'
import { AuthGuard } from '@nestjs/passport'
import { DateTime } from 'luxon'
import { ISession } from 'src/user/interfaces/session.interface'
import { Session } from 'src/shared/decorators/auth/session.decorator'
import { PassportData } from 'src/user/interfaces/passport-data.interface'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}


  @Get('logout')
  public logout(@Res({ passthrough: true }) response: FastifyReply) {
    response.clearCookie('refresh_token')
  }

  @UseGuards(AuthGuard('discord'))
  @Get('discord')
  public loginWithDiscord(
    @Request() request,
    @Res({ passthrough: true }) response: FastifyReply,
    @Session() session: ISession,
  ){
    return this.getToken(request.user, response, session)
  }

  @UseGuards(AuthGuard('google'))
  @Get('google')
  public loginWithGoogle(
    @Request() request,
    @Res({ passthrough: true }) response: FastifyReply,
    @Session() session: ISession,
  ){
    return this.getToken(request.user, response, session)
  }

  private async getToken(passportData: PassportData, response: FastifyReply, session: ISession){
    if(!passportData){
      throw 'No user'
    }
    const user = await this.authService.validatePassport(passportData, session)
    const expires = DateTime.now().plus({week: 4}).endOf('day')
    response.setCookie(
      'refresh_token',
      JSON.stringify({
        sub: user.id,
        expires
      }),
      {
        path: '/',
        signed: true,
        httpOnly: true,
        secure: true,
        sameSite: true,
        expires: expires.toJSDate(),
      })
      return {
        access_token: await this.authService.signSession(user, expires)
      }
  }
}

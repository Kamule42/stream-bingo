import { Controller, Get, Request, Res, UseGuards } from '@nestjs/common'
import { AuthService } from '../../services/auth/auth.service'
import { FastifyReply } from 'fastify'
import { AuthGuard } from '@nestjs/passport'
import { DateTime } from 'luxon'

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
    @Res({ passthrough: true }) response: FastifyReply
  ){
    return this.getToken(request.user, response)
  }

  @UseGuards(AuthGuard('google'))
  @Get('google')
  public loginWithGoogle(
    @Request() request,
    @Res({ passthrough: true }) response: FastifyReply
  ){
    return this.getToken(request.user, response)
  }

  private async getToken(user: any, response: FastifyReply){
    if(!user){
      throw 'No user'
    }
    const expires = DateTime.now().plus({week: 4}).endOf('day').toJSDate()
    response.setCookie(
      'refresh_token',
      JSON.stringify({
        sub: user.sub,
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
      return {
        access_token: await this.authService.signSession(user)
      }
  }
}

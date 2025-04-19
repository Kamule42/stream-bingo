import fastifyCookie, { Signer } from '@fastify/cookie'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { WsException } from '@nestjs/websockets'
import { DateTime } from 'luxon'
import { Socket } from 'socket.io'
import { ISession } from 'src/user/interfaces/session.interface';
import { AuthService } from 'src/user/services/auth/auth.service';

@Injectable()
export class RefreshGuard implements CanActivate {
  private readonly signer: Signer
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ){
    this.signer = new Signer(this.configService.get('cookie.secret') ?? '')
  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    switch(context.getType()){
      case 'ws': await this.handleWsRequest(context.switchToWs().getClient<Socket>()); break
    }
    return true;
  }

  private async handleWsRequest(client: Socket){
    if(!client.handshake.headers.cookie){
      return
    }
    const cookies = fastifyCookie.parse(client.handshake.headers.cookie)
    const identity = cookies.refresh_token
    if(!identity){
      return
    }
    const refreshTokenCookie = this.signer.unsign(identity)
    let session:ISession | null = client.handshake.auth.token ? 
      this.authService.validateToken(client.handshake.auth.token) :
      null
    const exp = session?.exp ? DateTime.fromSeconds(session.exp) : null
    const refreshTokenStr = refreshTokenCookie.value
    if((exp == null || exp < DateTime.now().plus({ seconds: 60})) && refreshTokenStr != null){
      const refreshToken = JSON.parse(refreshTokenStr) as {sub: string}
      const token = await this.authService.signSession(refreshToken.sub)
      session = this.authService.validateToken(token)
      client.handshake.auth.user = session
      client.handshake.auth.token = `Bearer ${token}`
      this.authService.newToken = token
    }

    if(session && !this.isValid(refreshTokenCookie, session)){
      throw new WsException('Invalid session')
    }
  }

  private isValid(refreshTokenCookie, session: ISession){
    const refreshToken = refreshTokenCookie.value ? JSON.parse(refreshTokenCookie.value) : null
    const refreshTokenExp = refreshToken?.expires ? DateTime.fromISO(refreshToken?.expires) : null
    return refreshToken != null && refreshTokenCookie.valid &&
      session != null &&
      session.sub === refreshToken.sub &&
      session.exp != null && DateTime.fromSeconds(session.exp) >= DateTime.now() && 
      refreshTokenExp != null &&
      refreshTokenExp >= DateTime.now()
  }
}

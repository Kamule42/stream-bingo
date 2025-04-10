import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { Socket } from 'socket.io'
import { Roles } from 'src/shared/decorators/auth/roles.decorator'
import { AuthService } from 'src/user/services/auth/auth.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    let session
    switch(context.getType()){
      case 'ws': {
        const wsContext = context.switchToWs()
        const client = wsContext.getClient<Socket>()
        const token = client.handshake.auth.token
        delete client.handshake.auth._session
        if(token){
          session = this.authService.validateToken(token)
          client.handshake.auth._session = session
        }
        break;
      }
      case 'http': break;
    }

    const roles = this.reflector.get<Array<string> | Object>(Roles, context.getHandler())
    return !roles || // Only a session needed
    session && Array.isArray(roles) && roles.some(role => session.rights.some(({right}) => right === role)) ||  // At least one role matches 
    session
  }
}

import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { Socket } from 'socket.io'
import { Roles } from 'src/shared/decorators/auth/roles.decorator'
import { IRole } from 'src/shared/interfaces/auth.interface'
import { ISession } from 'src/user/interfaces/session.interface'
import { AuthService } from 'src/user/services/auth/auth.service'

@Injectable()
export class AuthGuard implements CanActivate {
  
  private readonly logger = new Logger(AuthGuard.name)
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    let session: ISession | undefined = undefined
    let data: Object = {}
    switch(context.getType()){
      case 'ws': {
        const wsContext = context.switchToWs()
        const client = wsContext.getClient<Socket>()
        const token = client.handshake.auth.token
        delete client.handshake.auth._session
        if(token != null && token.trim().replace('Bearer ', '') != 'null'){
          try{
            session = this.authService.validateToken(token)
            data = {
              ...wsContext.getData(),
              ws: wsContext.getData()
            }
          }
          catch(error){
            this.logger.error('Error while validating token', error)
          }
          client.handshake.auth._session = session
        }
        break;
      }
      case 'http': break;
    }

    const roles = this.reflector.get<Array<IRole> | Object>(Roles, context.getHandler())
    const result = roles == null ||
      session != null && Array.isArray(roles) && [...roles, 'a'].some((role: IRole) => 
        session.rights?.some(({ right , streamId}) => {
          if(typeof role === 'string'){
            return right === role
          }
          const { id, streamKey } = role
          const s = streamKey.split('.').reduce((o, i) => o[i], data)
          return id === right && streamId === s && streamId !== undefined
        }) ?? false
      ) || session != null && !Array.isArray(roles)
      return result
  }
}

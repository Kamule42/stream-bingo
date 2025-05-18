import { ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { FastifyRequest } from 'fastify'
import { Socket } from 'socket.io'
import { Roles } from 'src/shared/decorators/auth/roles.decorator'
import { IRole } from 'src/shared/interfaces/auth.interface'
import { ISession } from 'src/user/interfaces/session.interface'
import { AuthService } from 'src/user/services/auth/auth.service'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name)

  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ){
    super()
  }

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<Array<IRole> | Object>(Roles, context.getHandler())
    let session: ISession | undefined = undefined
    let data: Object = {}
    switch(context.getType()){
      case 'ws': {
        const wsContext = context.switchToWs()
        const client = wsContext.getClient<Socket>()
        session =  client.handshake.auth.user
        break;
      }
      case 'http': {
        const httpContext = context.switchToHttp()
        const request = httpContext.getRequest()
        session = request.headers.authorization ?
          this.authService.validateToken(request.headers.authorization) :
          undefined
        request.session = session
        break;
      }
    }

    const result = roles == null ||
      session != null && Array.isArray(roles) && [...roles, 'a'].some((role: IRole) =>
        session.rights?.some(({ right, streamId }) => {
          if (typeof role === 'string') {
            return right === role
          }
          const { id, streamKey } = role
          const s = streamKey.split('.').reduce((o, i) => o[i], data)
          return id === right && streamId === s && streamId !== undefined
        })
      ) ||
      session != null && !Array.isArray(roles)
    return result || super.canActivate(context)
  }

  handleRequest(err: any, user, info, context){
    if(context.getType() === 'ws'){
      context.switchToWs().getClient().handshake.auth.user = user
    }
    return user
  }
}

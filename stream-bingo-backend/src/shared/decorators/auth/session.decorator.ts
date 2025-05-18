import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Socket } from 'socket.io'


export const Session = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        switch(context.getType()){
            case 'ws': {
              const wsContext = context.switchToWs()
              const client = wsContext.getClient<Socket>()
              return client.handshake.auth.user
            }
            case 'http': {
              const httpContext = context.switchToHttp()
              return httpContext.getRequest()?.session
            }
          }
        return undefined
    },
)


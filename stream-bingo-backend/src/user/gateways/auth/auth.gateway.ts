import fastifyCookie from '@fastify/cookie'
import { Interval } from '@nestjs/schedule'
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { AuthService } from 'src/user/services/auth/auth.service';

@WebSocketGateway({
  namespace: 'auth',
  transports: ['websocket', 'polling']
})
export class AuthGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly namespace: Namespace
  private readonly clients = new Map<string, string>()

  constructor(
    private readonly authService : AuthService
  ){}

  handleConnection(client: Socket) {
    if(!client.handshake.headers.cookie){
      return
    }
    const cookies = fastifyCookie.parse(client.handshake.headers.cookie)
    const identity = cookies.refresh_token
    this.clients.set(identity, client.id)
  }
  handleDisconnect(client: any) {
    if(!client.handshake.headers.cookie){
      return
    }
    const cookies = fastifyCookie.parse(client.handshake.headers.cookie)
    const identity = cookies.refresh_token
    this.clients.delete(identity)
  }

  afterInit() {
    this.authService.newToken$.subscribe({
      next: ({token, socketId}) => {
        const socketKey = this.clients.get(socketId)
        if(socketKey !== undefined){
          this.namespace.sockets.get(socketKey)?.emit('refreshToken', token)
        }
      }
    })
  }

  @Interval(30*60000)
  handleInterval() {
    const ids = [...this.namespace.sockets.keys()]
    for(const id of ids){
      const foundKey = [...this.clients.entries()].find(([_, value]) => value === id)?.at(0)
      if(foundKey){
        this.clients.delete(foundKey)
      }
    }
  }
}

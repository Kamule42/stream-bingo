import { OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { AuthService } from 'src/user/services/auth/auth.service';

@WebSocketGateway({
  namespace: 'auth',
  transports: ['websocket', 'polling']
})
export class AuthGateway implements OnGatewayInit {
  @WebSocketServer()
  private readonly namespace: Namespace
  constructor(
    private readonly authService : AuthService
  ){}

  afterInit() {
    this.authService.newToken$.subscribe({
      next: token => this.namespace.send('refreshToken', token)
    })
  }
}

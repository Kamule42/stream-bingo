import { WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({
  namespace: 'auth',
  transports: ['websocket', 'polling']
})
export class AuthGateway {
}

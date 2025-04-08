import { UseGuards } from '@nestjs/common'
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, } from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { Roles } from 'src/shared/decorators/auth/roles.decorator';
import { AuthGuard } from 'src/shared/guards/auth/auth.guard';

@WebSocketGateway({
  namespace: 'users',
  transports: ['websocket', 'polling']
})
@UseGuards(AuthGuard)
export class UserGateway {
  @Roles(['b'])
  @SubscribeMessage('searchByName')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,

  ): string {
    return 'Hello world!';
  }
}

import { UseGuards } from '@nestjs/common'
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WsResponse, } from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { Roles } from 'src/shared/decorators/auth/roles.decorator';
import { AuthGuard } from 'src/shared/guards/auth/auth.guard';
import { UserService } from 'src/user/services/user/user/user.service';

@WebSocketGateway({
  namespace: 'users',
  transports: ['websocket', 'polling']
})
@UseGuards(AuthGuard)
export class UserGateway {

  constructor(
    private readonly userService: UserService
  ){}

  @Roles(['a'])
  @SubscribeMessage('searchByName')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { name: string},

  ): Promise<WsResponse<Array<{id: string, name: string}>>> {
    return this.userService
      .findByName(payload.name)
      .then(users => ({
        event: 'userList',
        data: users?.map(({id, discordUsername}) => ({id, name: discordUsername}))
    }))
  }
}

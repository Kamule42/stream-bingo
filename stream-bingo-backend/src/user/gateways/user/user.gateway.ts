import { UseGuards } from '@nestjs/common'
import { MessageBody, SubscribeMessage, WebSocketGateway, WsResponse, } from '@nestjs/websockets'
import { Roles } from 'src/shared/decorators/auth/roles.decorator'
import { Session } from 'src/shared/decorators/auth/session.decorator'
import { UserService } from 'src/user/services/user/user/user.service'
import { ISearchResult } from './user.responses'
import { ISession } from 'src/user/interfaces/session.interface'
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth/jwt-auth.guard'
import { RefreshGuard } from 'src/shared/guards/refresh/refresh.guard'

@WebSocketGateway({
  namespace: 'users',
  transports: ['websocket', 'polling']
})
@UseGuards(JwtAuthGuard, RefreshGuard, )
export class UserGateway {

  constructor(
    private readonly userService: UserService
  ){}

  @Roles(['a'])
  @SubscribeMessage('searchByName')
  searchByName(
    @MessageBody() payload: { name: string},
  ): Promise<WsResponse<Array<ISearchResult>>> {
    return this.userService
      .findByName(payload.name)
      .then(users => ({
        event: 'userList',
        data: users?.map(({id, discordUsername}) => ({id, name: discordUsername}))
    }))
  }

  @Roles()
  @SubscribeMessage('flipFav')
  flipFav(
    @MessageBody('id') streamId: string,
    @Session() session: ISession
   )
  {
    this.userService.flipFav(session.sub, streamId)
  }
}

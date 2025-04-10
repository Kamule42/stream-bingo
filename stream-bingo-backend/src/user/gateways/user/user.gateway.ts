import { UseGuards } from '@nestjs/common'
import { MessageBody, SubscribeMessage, WebSocketGateway, WsResponse, } from '@nestjs/websockets'
import { Roles } from 'src/shared/decorators/auth/roles.decorator';
import { Session } from 'src/shared/decorators/auth/session.decorator';
import { AuthGuard } from 'src/shared/guards/auth/auth.guard';
import { UserService } from 'src/user/services/user/user/user.service';
import { IFavs, ISearchResult } from './user.responses';
import { ISession } from 'src/user/interfaces/session.interface';

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
  @SubscribeMessage('getMyFavs')
  getMyFavs(
    @Session() session: ISession
   ) : Promise<WsResponse<Array<IFavs>>>
  {
    return this.userService
      .getFavs(session.sub)
      .then(user => ({
        event: 'myFavs',
        data: user?.favs?.map(stream => ({
          streamId: stream.id,
          streamName: stream.name,
          twitchId: stream.twitchId,
          streamTwitchHandle: stream.twitchLogin,
        })) ?? []
    }))
  }
}

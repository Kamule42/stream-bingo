import { UseGuards } from '@nestjs/common'
import { MessageBody, SubscribeMessage, WebSocketGateway, WsResponse, } from '@nestjs/websockets'
import { Roles } from 'src/shared/decorators/auth/roles.decorator'
import { Session } from 'src/shared/decorators/auth/session.decorator'
import { UserService } from 'src/user/services/user/user/user.service'
import { ISearchResult } from './user.responses'
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth/jwt-auth.guard'
import { RefreshGuard } from 'src/shared/guards/refresh/refresh.guard'
import { ISession } from 'src/user/interfaces/session.interface'

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
  @SubscribeMessage('deleteAccount')
  async deleteAccount(
    @Session() session: ISession,
  ): Promise<WsResponse<boolean>>{
    console.log('session', session)
    const result = await this.userService.deleteUser(session.sub)
    console.log('result', result)
    return {
      event: 'accountDeleted',
      data: true
    }
  }
}

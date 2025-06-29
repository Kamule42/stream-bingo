import fastifyCookie from '@fastify/cookie'
import { UseGuards } from '@nestjs/common'
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WsException, WsResponse, } from '@nestjs/websockets'
import { Roles } from 'src/shared/decorators/auth/roles.decorator'
import { Session } from 'src/shared/decorators/auth/session.decorator'
import { UserService } from 'src/user/services/user/user/user.service'
import { ISearchResult } from './user.responses'
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth/jwt-auth.guard'
import { RefreshGuard } from 'src/shared/guards/refresh/refresh.guard'
import { ISession } from 'src/user/interfaces/session.interface'
import { AuthService } from 'src/user/services/auth/auth.service'
import { Socket } from 'socket.io'
import { UserEntity } from 'src/user/entities/user.entity'

@WebSocketGateway({
  namespace: 'users',
  transports: ['websocket', 'polling']
})
@UseGuards(JwtAuthGuard, RefreshGuard, )
export class UserGateway {

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
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
        data: users?.map(({id, username}) => ({id, name: username}))
    }))
  }

  @Roles()
  @SubscribeMessage('deleteAccount')
  async deleteAccount(
    @Session() session: ISession,
  ): Promise<WsResponse<boolean>>{
    const result = await this.userService.deleteUser(session.sub)
    return {
      event: 'accountDeleted',
      data: result.affected === 1
    }
  }

   @Roles()
   @SubscribeMessage('updateUsername')
   async updateUsername(
    @ConnectedSocket() client: Socket,
    @Session() session: ISession,
    @MessageBody('username') username: string
   ): Promise<WsResponse<boolean>>{
    try {
      const user = await this.userService.updateUsername(session.sub, username)
      
      this.refreshToken(client, user)
      return {
        event: 'usernameUpdated',
        data: true
      }
    }
    catch{
      return {
        event: 'usernameUpdated',
        data: false
      }
    }
   }

   @Roles()
   @SubscribeMessage('setActiveIcon')
   async setActiveIcon(
    @ConnectedSocket() client: Socket,
    @Session() session: ISession,
    @MessageBody('provider') provider: string
  ){
    const user = await this.userService.setActiveIcon(session.sub, provider)
    this.refreshToken(client, user)
  }

  private async refreshToken(client: Socket, user: UserEntity){
    if(!client.handshake.headers.cookie){
      throw new WsException('No session available')
    }
    const cookies = fastifyCookie.parse(client.handshake.headers.cookie)
    const identity = cookies.refresh_token
    this.authService.newToken = {
      token: await this.authService.signSession(user),
      socketId: identity
    }
  }
}

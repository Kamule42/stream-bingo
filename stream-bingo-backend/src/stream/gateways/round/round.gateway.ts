import { UseGuards } from '@nestjs/common'
import { MessageBody, SubscribeMessage, WebSocketGateway, WsException, WsResponse } from '@nestjs/websockets'
import { IRound, IRoundEdit } from './round.interface'
import { RoundService } from 'src/stream/services/round/round.service'
import { Roles } from 'src/shared/decorators/auth/roles.decorator'
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth/jwt-auth.guard'
import { RefreshGuard } from 'src/shared/guards/refresh/refresh.guard'
import { roundMapper } from './round.mapper'
import { UserRoles } from 'src/shared/roles'
import { RoundStatus } from 'src/stream/entities/round.entity'
import { ISession } from 'src/user/interfaces/session.interface'
import { Session } from 'src/shared/decorators/auth/session.decorator'

@WebSocketGateway({
  namespace: 'rounds',
  transports: ['websocket', 'polling']
})
@UseGuards(JwtAuthGuard, RefreshGuard, )
export class RoundGateway {
  constructor(
    private readonly roundService: RoundService
  ){}

  @SubscribeMessage('getCurrentRoundForStream')
  GetCurrentRoundForStream(
    @MessageBody('streamId') streamId: string
  ): Promise<WsResponse<IRound>> {
    return this.roundService.getStreamCurrentRound(streamId)
    .then(round => ({
      event: 'roundDetail',
      data: roundMapper(round)
    }))
  }

  @SubscribeMessage('getRoundForGrid')
  getRoundForGrid(
    @MessageBody('gridId') gridId: string,
    @Session() session?: ISession
  ): Promise<WsResponse<IRound>> {
    return this.roundService.getRoundForGrid(gridId, session?.sub)
    .then(round => {
        if(round === null){
          throw new WsException({ type: 'unknownRound'})
        }
        return {
        event: 'roundDetail',
        data: roundMapper(round)
      }
    })
  }

  @SubscribeMessage('getRoundsForStream')
  getRoundsForStream(
    @MessageBody('streamId') streamId: string
  ): Promise<WsResponse<Array<IRound>>> {
    return this.roundService.getStreamRounds(streamId).then( result => ({
      event: 'streamRounds',
      data: result.map(roundMapper)
    }))
  }

  @Roles([
    {id: UserRoles.stream.plan, streamKey: 'streamId'}
  ])
  @SubscribeMessage('updateStreamRounds')
  updateStreamRounds(
    @MessageBody('streamId') streamId: string,
    @MessageBody('rounds') rounds: Array<IRoundEdit>,
    @MessageBody('toDelete') toDelete?: Array<string>,
  ): void {
    this.roundService.updateStreamRounds(streamId, rounds, toDelete)
  }

  @Roles([
    {id: UserRoles.stream.manage, streamKey: 'streamId'}
  ])
  @SubscribeMessage('updateStreamStatus')
  async updateStreamStatus(
    @MessageBody('streamId') streamId: string,
    @MessageBody('status') status: RoundStatus,
  ) : Promise<WsResponse<IRound> | void> {
    const updated = await this.roundService.streamRoundStatus(streamId, status)
    if(updated != null){
      return {
        event: 'roundDetail',
        data: roundMapper(updated)
      }
    }
  }
}

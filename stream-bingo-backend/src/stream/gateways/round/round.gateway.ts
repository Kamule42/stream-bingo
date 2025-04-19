import { UseGuards } from '@nestjs/common'
import { MessageBody, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets'
import { IRound, IRoundEdit } from './round.interface'
import { RoundService } from 'src/stream/services/round/round.service'
import { Roles } from 'src/shared/decorators/auth/roles.decorator'
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth/jwt-auth.guard'
import { RefreshGuard } from 'src/shared/guards/refresh/refresh.guard'
import { roundMapper } from './round.mapper'
import { UserRoles } from 'src/shared/roles'
import { RoundStatus } from 'src/stream/entities/round.entity'

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
  ): void {
    this.roundService.updateStreamRounds(streamId, rounds)
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

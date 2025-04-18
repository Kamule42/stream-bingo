import { UseGuards } from '@nestjs/common'
import { MessageBody, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets'
import { IRound, IRoundEdit } from './round.interface'
import { RoundService } from 'src/stream/services/round/round.service'
import { Roles } from 'src/shared/decorators/auth/roles.decorator'
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth/jwt-auth.guard'
import { RefreshGuard } from 'src/shared/guards/refresh/refresh.guard'

@WebSocketGateway({
  namespace: 'rounds',
  transports: ['websocket', 'polling']
})
@UseGuards(JwtAuthGuard, RefreshGuard, )
export class RoundGateway {
  constructor(
    private readonly roundService: RoundService
  ){}

  @SubscribeMessage('getRoundsForStream')
  getRoundsForStream(
    @MessageBody('streamId') streamId: string
  ): Promise<WsResponse<Array<IRound>>> {
    return this.roundService.getStreamRounds(streamId).then( result => ({
      event: 'streamRounds',
      data: result.map(round => ({
        id: round.id,
        name: round.name,
        startAt: round.startAt,
        streamStartAt: round.streamStartAt,
        streamId: round.stream.id,
        streamName: round.stream.name,
      }))
    }))
  }

  @Roles([
    {id: 'plan', streamKey: 'streamId'}
  ])
  @SubscribeMessage('updateStreamRounds')
  updateStreamRounds(
    @MessageBody('streamId') streamId: string,
    @MessageBody('rounds') rounds: Array<IRoundEdit>,
  ): void {
    this.roundService.updateStreamRounds(streamId, rounds)
  }
}

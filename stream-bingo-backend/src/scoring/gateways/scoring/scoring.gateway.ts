import { UseGuards } from '@nestjs/common'
import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Paginate, PaginateQuery } from 'nestjs-paginate'
import { ScoringService } from 'src/scoring/services/scoring/scoring.service'
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth/jwt-auth.guard'
import { RefreshGuard } from 'src/shared/guards/refresh/refresh.guard'
import { IScore } from './score.interface'
import { IPaginatedResponse } from 'src/shared/interfaces/paginated.interface'
import { toPaginationMeta } from 'src/shared/functions/paginated'
import { leaderboardMapper } from './scoring.mappers'

@WebSocketGateway({
  namespace: 'scoring',
  transports: ['websocket', 'polling']
})
@UseGuards(JwtAuthGuard, RefreshGuard, )
export class ScoringGateway {
  constructor(
    private readonly scoringService: ScoringService
  ){}

  @SubscribeMessage('getLeaderBoardForStream')
  getLeaderBoardForStream(
    @Paginate() query: PaginateQuery,
    @MessageBody('streamId') streamId: string
  ): Promise<IPaginatedResponse<IScore>> {
    return this.scoringService.getLeaderBoardForStream(streamId, query)
    .then(result => ({
      event: 'leaderBoardForStream',
      data: {
        data: result.data.map(s => leaderboardMapper(s)),
        meta: toPaginationMeta(result.meta),
      }
    }))
  }
}

import { UseGuards } from '@nestjs/common';
import { MessageBody, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import { GridService } from 'src/grid/services/grid/grid.service';
import { AuthGuard } from 'src/shared/guards/auth/auth.guard';
import { IGrid } from './grid.interface';
import { Roles } from 'src/shared/decorators/auth/roles.decorator';
import { Session } from 'src/shared/decorators/auth/session.decorator';
import { ISession } from 'src/user/interfaces/session.interface';

@WebSocketGateway({
  namespace: 'grids',
  transports: ['websocket', 'polling']
})
@UseGuards(AuthGuard)
export class GridGateway {
  constructor(
    private readonly gridService: GridService,
  ){}

  @Roles()
  @SubscribeMessage('getGridForStream')
  getGridForStream(
    @MessageBody('string') streamId: string,
    @Session() session: ISession,
  ): Promise<WsResponse<IGrid | null>> {
    return this.gridService.getGridForStream(streamId, session.sub)
      .then(grid => ({
        event: 'gridForStream',
        data: grid != null ?{
          id: grid.id,
          streamId: grid.round.stream.id,
          streamName: grid.round.stream.name,
          roundId: grid.round.id,
          roundName: grid.round.name,
          streamStartAt: grid.round.streamStartAt,
          cells: []
        } : null
      }))
  }
}

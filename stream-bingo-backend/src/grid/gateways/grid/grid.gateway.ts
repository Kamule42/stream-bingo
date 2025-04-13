import { UseGuards } from '@nestjs/common'
import { MessageBody, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets'
import { GridService } from 'src/grid/services/grid/grid.service'
import { AuthGuard } from 'src/shared/guards/auth/auth.guard'
import { IGrid } from './grid.interface'
import { Roles } from 'src/shared/decorators/auth/roles.decorator'
import { Session } from 'src/shared/decorators/auth/session.decorator'
import { ISession } from 'src/user/interfaces/session.interface'
import { gridMapper } from './grid.mapper'

@WebSocketGateway({
  namespace: 'grids',
  transports: ['websocket', 'polling']
})
@UseGuards(AuthGuard)
export class GridGateway {
  constructor(
    private readonly gridService: GridService,
  ){}

  @SubscribeMessage('getGridForStream')
  getGridForStream(
    @MessageBody('streamId') streamId: string,
    @MessageBody('bingoId') bingoId?: string,
    @Session() session?: ISession,
  ): Promise<WsResponse<IGrid | null>> {
    return this.gridService.getGridForStream(streamId, session?.sub, bingoId)
      .then(grid => ({
        event: 'gridForStream',
        data: grid != null ? gridMapper(grid) : null
      }))
  }
  @SubscribeMessage('createGridForStream')
  createGridForStream(
    @MessageBody('streamId') streamId: string,
    @Session() session?: ISession,
  ): Promise<WsResponse<IGrid>> {
    return this.gridService.createGrid(streamId, session?.sub)
    .then(grid => ({
      event: 'gridForStream',
      data: gridMapper(grid)
    }))
  }  
}

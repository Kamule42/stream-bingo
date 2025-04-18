import { UseGuards } from '@nestjs/common'
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets'
import { GridService } from 'src/grid/services/grid/grid.service'
import { IGrid, IValidatedCell } from './grid.interface'
import { Roles } from 'src/shared/decorators/auth/roles.decorator'
import { Session } from 'src/shared/decorators/auth/session.decorator'
import { ISession } from 'src/user/interfaces/session.interface'
import { gridMapper } from './grid.mapper'
import { ValidatedCellsService } from 'src/grid/services/validated-cells/validated-cells.service'
import { Namespace, Socket } from 'socket.io'
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth/jwt-auth.guard'
import { RefreshGuard } from 'src/shared/guards/refresh/refresh.guard'

@WebSocketGateway({
  namespace: 'grids',
  transports: ['websocket', 'polling']
})
@UseGuards(JwtAuthGuard, RefreshGuard, )
export class GridGateway {
  @WebSocketServer()
  private readonly server: Namespace

  constructor(
    private readonly gridService: GridService,
    private readonly validatedCellsService: ValidatedCellsService,
  ){}

  @SubscribeMessage('subscribeForStream')
  subscribeForStream(
    @ConnectedSocket() client: Socket,
    @MessageBody('streamId') streamId: string,
  ): Promise<WsResponse<{streamId: string, cells: Array<IValidatedCell>}>>{
    client.join(`stream_${streamId}`)
    return this.validatedCellsService
      .getValidatedCellsForStream(streamId)
      .then(cells => ({
        event: 'validatedcells',
        data: {
          streamId,
          cells: cells.map(cell => ({
            cellId: cell.cellId,
            valide: cell.valide,
          }))
        }
      }))
  }

  @SubscribeMessage('unsubscribeForStream')
  unsubscribeForStream(
    @ConnectedSocket() client: Socket,
    @MessageBody('streamId') streamId: string,
  ){
    client.leave(`stream_${streamId}`)
  }

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

  @Roles([
    {id: 'man', 'streamKey': 'streamId'},
    {id: 'mod', 'streamKey': 'streamId'},
  ])
  @SubscribeMessage('flipCell')
  async flipCell(
    @MessageBody('streamId') streamId: string,
    @MessageBody('cellId') cellId: string,
  ): Promise<void> {
    const cells: Array<IValidatedCell> = await this.validatedCellsService
      .flipCell(streamId, cellId)
      .then(cells => cells.map(cell => ({
        cellId: cell.cellId,
        valide: cell.valide,
      })))
    
    this.server.to(`stream_${streamId}`).emit("validatedcells", {
      streamId,
      cells
    })
  }
}

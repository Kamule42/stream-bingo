import { UseGuards } from '@nestjs/common'
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException, WsResponse } from '@nestjs/websockets'
import { GridService } from 'src/grid/services/grid/grid.service'
import { IGrid, IGridSummary, IValidatedCell } from './grid.interface'
import { Roles } from 'src/shared/decorators/auth/roles.decorator'
import { Session } from 'src/shared/decorators/auth/session.decorator'
import { ISession } from 'src/user/interfaces/session.interface'
import { gridMapper, gridSummaryMapper } from './grid.mapper'
import { ValidatedCellsService } from 'src/grid/services/validated-cells/validated-cells.service'
import { Namespace, Socket } from 'socket.io'
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth/jwt-auth.guard'
import { RefreshGuard } from 'src/shared/guards/refresh/refresh.guard'
import { Paginate, PaginateQuery } from 'nestjs-paginate'
import { IPaginatedResponse } from 'src/shared/interfaces/paginated.interface'
import { toPaginationMeta } from 'src/shared/functions/paginated'

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

  @SubscribeMessage('subscribeForRound')
  subscribeForStream(
    @ConnectedSocket() client: Socket,
    @MessageBody('roundId') roundId: string,
  ): Promise<WsResponse<{roundId: string, cells: Array<IValidatedCell>}>>{
    client.join(`round_${roundId}`)
    return this.validatedCellsService
      .getValidatedCellsForRound(roundId)
      .then(cells => ({
        event: 'validatedcells',
        data: {
          roundId,
          cells: cells.map(cell => ({
            cellId: cell.cellId,
            valide: cell.valide,
            at: cell.updatedAt ?? cell.createdAt
          }))
        }
      }))
  }

  @SubscribeMessage('unsubscribeForRound')
  unsubscribeForStream(
    @ConnectedSocket() client: Socket,
    @MessageBody('roundId') roundId: string,
  ){
    client.leave(`round_${roundId}`)
  }

  @SubscribeMessage('getGridForStream')
  getGridForStream(
    @MessageBody('streamId') streamId: string,
    @MessageBody('bingoId') bingoId?: string,
    @Session() session?: ISession,
  ): Promise<WsResponse<IGrid | null>> {
    return this.gridService.getGridForStream(streamId, session?.sub, bingoId)
      .then(grid => {
        if(grid === null){
          throw new WsException({
            type: 'unkownGrid'
          })
        }
        return {
          event: 'gridForStream',
          data: grid != null ? gridMapper(grid) : null
        }
    })
  }

  @Roles()
  @SubscribeMessage('getMyGrids')
  getMyGrids(
    @Session() session: ISession,
    @Paginate() query: PaginateQuery,
    @MessageBody('streamId') streamId: string,
  ): Promise<IPaginatedResponse<IGridSummary>> {
    return this.gridService.getUserGrids(session?.sub, query, streamId)
      .then(result => ({
        event: 'myGrids',
        data: {
          data: result.data.map(gridSummaryMapper),
          meta: toPaginationMeta(result.meta),
        }
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
    @MessageBody('roundId') roundId: string,
    @MessageBody('cellId') cellId: string,
  ): Promise<void> {
    const cells: Array<IValidatedCell> = await this.validatedCellsService
      .flipCell(roundId, cellId)
      .then(cells => cells.map(cell => ({
        cellId: cell.cellId,
        valide: cell.valide,
      })))
    
    this.server.to(`round_${roundId}`).emit("validatedcells", {
      roundId,
      cells
    })
  }

  @SubscribeMessage('flipGridCell')
  async flipGridCell(
    @MessageBody('gridId') gridId: string,
    @MessageBody('cellIndex') cellIndex: number,
    @Session() session?: ISession,
  ): Promise<WsResponse<IGrid>> {
    return this.gridService
      .flipCell(gridId, cellIndex, session?.sub)
      .then(grid => ({
        event: 'gridForStream',
        data: gridMapper(grid)
      }))
  }
}

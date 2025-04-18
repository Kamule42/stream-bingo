import { MessageBody, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets'
import { map, Observable } from 'rxjs'
import { StreamService } from 'src/stream/services/stream/stream.service'
import { ICell, INextStream, IRight, IStream } from './stream.interface' 
import { cellsMapper, nextStreamMapper, streamMapper } from './stream.mappers'
import { Paginate, PaginateQuery } from 'nestjs-paginate'
import { UseGuards } from '@nestjs/common'
import { Roles } from 'src/shared/decorators/auth/roles.decorator'
import { IPaginatedResponse } from 'src/shared/interfaces/paginated.interface'
import { toPaginationMetal } from 'src/shared/functions/paginated'
import { CellService } from 'src/stream/services/cell/cell.service'
import { ISession } from 'src/user/interfaces/session.interface'
import { IFav } from 'src/user/gateways/user/user.responses'
import { Session } from 'src/shared/decorators/auth/session.decorator'
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth/jwt-auth.guard'
import { RefreshGuard } from 'src/shared/guards/refresh/refresh.guard'

@WebSocketGateway({
  namespace: 'streams',
  transports: ['websocket', 'polling']
})
@UseGuards(JwtAuthGuard, RefreshGuard, )
export class StreamGateway {
  constructor(
    private readonly streamService: StreamService,
    private readonly cellService: CellService,
  ){}

  @SubscribeMessage('getList')
  @Roles(['a'])
  getStreams(
    @Paginate() query: PaginateQuery,
  ): Observable<WsResponse<IPaginatedResponse<IStream>>> {
    return this.streamService.listServices(query, false).pipe(
      map(result => ({
        event: 'streamList',
        data: {
          data: result.data.map(s => streamMapper(s, true)),
          meta: toPaginationMetal(result.meta),
        }
      }))
    )
  }

  
  @SubscribeMessage('updateStream')
  @Roles(['a'])
  updateStream(
    @MessageBody() stream: IStream<Omit<IRight, 'username'>>,
  ): void {
    this.streamService.updateStream(stream)
  }

  @SubscribeMessage('getNexts')
  getNextStreams(
    @Paginate() query: PaginateQuery,
  ): Observable<WsResponse<IPaginatedResponse<INextStream>>> {
    return this.streamService.listNextServices(query).pipe(
      map(result => ({
        event: 'nextStreams',
        data: {
          data: result.data.map(nextStreamMapper).filter(val => val != null),
          meta: toPaginationMetal(result.meta),
        }
      }))
    );
  }

  @SubscribeMessage('getDetail')
  getStreamDetail(@MessageBody('webhandle') webhandle: string): Observable<WsResponse<INextStream | null>>{
    return this.streamService.getStreamDetail(webhandle).pipe(
      map(stream => ({
        event: 'streamDetail',
        data: nextStreamMapper(stream)
      } ))
    )
  }

  @Roles([
    {id: 'man', 'streamKey': 'id'}
  ])
  @SubscribeMessage('getStreamCells')
  getStreamCells(@MessageBody('id') id: string): Promise<WsResponse<Array<ICell>>>{
    return this.cellService.getStreamCells(id).then(cells => ({
      event: 'streamCells',
      data: cellsMapper(cells)
    }))
  }

  @Roles([
    {id: 'man', 'streamKey': 'id'}
  ])
  @SubscribeMessage('updateCellsFormStream')
  updateCellsFormStream(
    @MessageBody('id') id: string,
    @MessageBody('cells') cells: Array<ICell>
  ){
    this.cellService.updateCells(id, cells)
  }

  @Roles()
  @SubscribeMessage('getMyFavs')
  getMyFavs(
    @Session() session: ISession
   ) : Promise<WsResponse<Array<IFav>>>
  {
    return this.streamService
      .getFavs(session.sub)
      .then(streams => ({
        event: 'myFavs',
        data: streams
          .filter(stream => stream != undefined)
          .map(stream => ({
            streamId: stream.id,
            streamName: stream.name,
            twitchId: stream.twitchId,
            streamTwitchHandle: stream.twitchLogin,
          })) ?? []
    }))
    .then(({event, data}) => ({
      event,
      data: [...new Set(data)]
    }))
  }
}

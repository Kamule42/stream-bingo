import { MessageBody, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets'
import { map, Observable } from 'rxjs'
import { StreamService } from 'src/stream/services/stream/stream.service'
import { INextStream, IRight, IStream, IStreamWithNextRound } from './stream.interface' 
import { nextStreamMapper, streamMapper } from './stream.mappers'
import { Paginate, PaginateQuery } from 'nestjs-paginate'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from 'src/shared/guards/auth/auth.guard'
import { Roles } from 'src/shared/decorators/auth/roles.decorator'
import { IPaginatedResponse } from 'src/shared/interfaces/paginated.interface'
import { toPaginationMetal } from 'src/shared/functions/paginated'

@WebSocketGateway({
  namespace: 'streams',
  transports: ['websocket', 'polling']
})
@UseGuards(AuthGuard)
export class StreamGateway {
  constructor(
    private readonly streamService: StreamService
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
}

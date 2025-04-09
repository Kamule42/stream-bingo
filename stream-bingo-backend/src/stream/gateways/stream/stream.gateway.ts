import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets'
import { map, Observable } from 'rxjs'
import { StreamService } from 'src/stream/services/stream/stream.service'
import { IRight, IStream, IStreamWithNextRound } from './stream.interface' 
import { streamMapper } from './stream.mappers'
import { Paginate, PaginateQuery } from 'nestjs-paginate'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from 'src/shared/guards/auth/auth.guard'
import { Socket } from 'socket.io'
import { Session } from 'src/shared/decorators/auth/session.decorator'
import { Roles } from 'src/shared/decorators/auth/roles.decorator'

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
  ): Observable<WsResponse<any>> {
    return this.streamService.listServices(query).pipe(
      map(result => ({
        event: 'streamList',
        data: {
          data: result.data.map(s => streamMapper(s, true)),
          link: result.links,
          meta: result.meta,
        }
      }))
    )
  }

  
  @SubscribeMessage('updateStream')
  @Roles(['a'])
  updateStream(
    @Paginate() stream: IStream<Omit<IRight, 'username'>>,
  ): void {
    this.streamService.updateStream(stream)
  }

  @SubscribeMessage('getNexts')
  getNextStreams(): Observable<WsResponse<Array<IStreamWithNextRound>>> {
    return this.streamService.listNextServices().pipe(
      map(streams => ({
        event: 'nextStreams',
        data: streams.map(stream => ({
          ...streamMapper(stream),
          nextStreamStartsAt: stream.rounds?.at(0)?.streamStartAt ?? new Date(),
          nextRoundStartsAt: stream.rounds?.at(0)?.startAt ?? new Date()
        }))
      }))
    );
  }

  @SubscribeMessage('getDetail')
  getStreamDetail(@MessageBody('webhandle') webhandle: string): Observable<WsResponse<IStreamWithNextRound | null>>{
    return this.streamService.getStreamDetail(webhandle).pipe(
      map(stream => ({
        event: 'streamDetail',
        data: stream ? {
          ...streamMapper(stream),
          nextStreamStartsAt: stream.rounds?.at(0)?.streamStartAt ?? new Date(),
          nextRoundStartsAt: stream.rounds?.at(0)?.startAt ?? new Date()
        } : null
      } ))
    )
  }
}

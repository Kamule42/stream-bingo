import { MessageBody, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets'
import { map, Observable } from 'rxjs';
import { StreamService } from 'src/stream/services/stream/stream.service'
import { IStreamWithNextRound } from './stream.interface' 
import { streamMapper } from './stream.mappers';
import { Paginate, PaginateQuery } from 'nestjs-paginate';

@WebSocketGateway({
  namespace: 'streams',
  transports: ['websocket', 'polling']
})
export class StreamGateway {
  constructor(
    private readonly streamService: StreamService
  ){}

  @SubscribeMessage('getList')
  //Paginated<IStream>
  getStreals(@Paginate() query: PaginateQuery): Observable<WsResponse<any>> {
    return this.streamService.listServices(query).pipe(
      map(result => ({
        event: 'streamList',
        data: {
          data: result.data.map(streamMapper),
          link: result.links,
          meta: result.meta,
        }
      }))
    );
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

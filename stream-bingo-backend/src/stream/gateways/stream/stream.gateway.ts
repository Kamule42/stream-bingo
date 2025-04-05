import { SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets'
import { map, Observable } from 'rxjs';
import { StreamService } from 'src/stream/services/stream/stream.service'
import { IStream, IStreamWithNextRound } from './stream.interface' 
import { streamMapper } from './stream.mappers';

@WebSocketGateway({
  namespace: 'streams',
  transports: ['websocket', 'polling']
})
export class StreamGateway {
  constructor(
    private readonly streamService: StreamService
  ){}

  @SubscribeMessage('getList')
  getStreals(): Observable<WsResponse<Array<IStream>>> {
    return this.streamService.listServices().pipe(
      map(streams => ({
        event: 'streamList',
        data: streams.map(streamMapper)
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
}

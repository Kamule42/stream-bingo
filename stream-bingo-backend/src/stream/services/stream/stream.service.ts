import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from, map, tap  } from 'rxjs';
import { StreamEntity } from 'src/stream/entities/stream.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StreamService {
  constructor(
    @InjectRepository(StreamEntity)
    private readonly streamRepository: Repository<StreamEntity>,){}

  listServices(): Observable<Array<StreamEntity>> {
    return from (this.streamRepository.findBy({enabled: true}))
  }
  listNextServices(): Observable<Array<StreamEntity>> {
    return from (this.streamRepository
        .createQueryBuilder('streams')
        .leftJoinAndSelect('streams.rounds', 'rounds')
        .where('rounds.created_at IS NOT NULL')
        .andWhere('rounds.startAt <= now()')
        .andWhere('rounds.streamStartAt > now()')
        .orderBy('streams.id', 'ASC')
        .addOrderBy('rounds.streamStartAt', 'ASC') 
        .distinctOn(['streams.id'])
        .limit(10)
        .getMany()
    )
  }

  getStreamDetail(webhandle: string): Observable<StreamEntity | null>{
    return from(this.streamRepository.findOneBy({twitchLogin: webhandle}))
  }
}

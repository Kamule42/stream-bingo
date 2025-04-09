import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import { Observable, from,  } from 'rxjs'
import { StreamEntity } from 'src/stream/entities/stream.entity'
import { IStream, IRight } from 'src/stream/gateways/stream/stream.interface';
import { Repository } from 'typeorm';

@Injectable()
export class StreamService {
  constructor(
    @InjectRepository(StreamEntity)
    private readonly streamRepository: Repository<StreamEntity>,){}

  listServices(query: PaginateQuery): Observable<Paginated<StreamEntity>> {
    return from (paginate(query, this.streamRepository, {
      where: { enabled: true },
      sortableColumns: ['name', 'twitchId', 'twitchLogin', 'createdAt'],
      defaultSortBy: [['name', 'ASC']],
    }))
    //this.streamRepository.findBy({enabled: true})
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

  async updateStream(stream: IStream<Omit<IRight, "username">>) {
    const existingStream = await this.streamRepository.findOneBy({
      id: stream.id
    })
    if(existingStream){
      this.streamRepository.save({
        ...existingStream,
        name: stream.name,
        twitchId: stream.twitchId,
        twitchLogin: stream.urlHandle
      })
    }
  }
}

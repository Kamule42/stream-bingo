import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import { Observable, from,  } from 'rxjs'
import { NextStreamEntity } from 'src/stream/entities/next-stream.entity';
import { StreamEntity } from 'src/stream/entities/stream.entity'
import { IStream, IRight } from 'src/stream/gateways/stream/stream.interface'
import { Repository, DataSource, Not, IsNull, } from 'typeorm'

@Injectable()
export class StreamService {
  constructor(
    @InjectRepository(StreamEntity)
    private readonly streamRepository: Repository<StreamEntity>,
    @InjectRepository(NextStreamEntity)
    private readonly nextStreamRepository: Repository<NextStreamEntity>,
    
    private readonly dataSource: DataSource,
  ){}

  listServices(
    query: PaginateQuery,
    onlyEnabled: boolean = true
  ): Observable<Paginated<StreamEntity>> {
    return from (paginate(query, this.streamRepository, {
      where: onlyEnabled ? { enabled: true } : undefined,
      sortableColumns: ['name', 'twitchId', 'twitchLogin', 'createdAt'],
      defaultSortBy: [['name', 'ASC']],
      relations: ['rights', 'rights.user']
    }))
  }

  listNextServices( 
    query: PaginateQuery,
  ): Observable<Paginated<NextStreamEntity>> {
    return from (paginate(
      query,
      this.nextStreamRepository ,
      {
        where: {
          startAt: Not(IsNull())
        },
        sortableColumns: ['startAt'],
        defaultSortBy: [
          ['id', 'ASC'],
          ['startAt', 'ASC']
        ],
      }
    ))
  }

  getStreamDetail(webhandle: string): Observable<NextStreamEntity | null>{
    return from(this.nextStreamRepository.findOneBy({
      twitchLogin: webhandle
    }))
  }

  async updateStream(updatedStream: IStream<Omit<IRight, "username">>) {
    await this.dataSource.transaction(async manager => {
      const existingStream = await manager.findOne(StreamEntity, {
        where: { id: updatedStream.id },
        relations: ['rights', 'rights.user'],
      })
      if(existingStream){
        const currentRights = existingStream.rights
        const toRemove = currentRights
          .filter(({user, rightKey}) => !updatedStream?.rights?.some(
            ({right, user_id}) => right === rightKey && user_id === user.id)
          )
        for (const right of toRemove) {
          await manager.remove(right)
        }
      }
      const toUpdate = {
        id: updatedStream.id,
        name: updatedStream.name,
        twitchId: updatedStream.twitchId,
        twitchLogin: updatedStream.urlHandle,
        enabled: updatedStream.enabled ?? false,
        rights: updatedStream.rights?.map(({user_id, right}) => ({
          rightKey: right,
          stream: {id: updatedStream.id },
          user: {id: user_id},
        })) ?? []
      }
      await manager.save(StreamEntity,toUpdate)
    })
  }
}

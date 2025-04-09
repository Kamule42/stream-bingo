import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import { Observable, from,  } from 'rxjs'
import { AuthGuard } from 'src/shared/guards/auth/auth.guard';
import { StreamEntity } from 'src/stream/entities/stream.entity'
import { IStream, IRight } from 'src/stream/gateways/stream/stream.interface'
import { Repository, DataSource } from 'typeorm'

@Injectable()
export class StreamService {
  constructor(
    @InjectRepository(StreamEntity)
    private readonly streamRepository: Repository<StreamEntity>,
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
        const toUpdate = {
          ...existingStream,
          name: updatedStream.name,
          twitchId: updatedStream.twitchId,
          twitchLogin: updatedStream.urlHandle,
          enabled: updatedStream.enabled ?? true,
          rights: updatedStream.rights?.map(({user_id, right}) => ({
            rightKey: right,
            stream: {id: existingStream.id },
            user: {id: user_id},
          })) ?? []
        }
        await manager.save(StreamEntity,toUpdate)
      }
    })
  }
}

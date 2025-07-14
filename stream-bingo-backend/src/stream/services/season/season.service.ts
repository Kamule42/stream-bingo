import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import { SeasonEntity } from 'src/stream/entities/season.entity'
import { ICreateSeason } from 'src/stream/poto'
import { Like, Repository } from 'typeorm'

@Injectable()
export class SeasonService {
constructor(
  @InjectRepository(SeasonEntity)
  private readonly seasonRepository: Repository<SeasonEntity>,
){}

  getStreamSeasons(query: PaginateQuery, streamId: string, searchTerm: string): Promise<Paginated<SeasonEntity>> {
    const where =  {
      stream: {id : streamId},
      ...( searchTerm?.trim()?.length > 0 ?{ name:  Like(`%${searchTerm}%`)} : {}),
    }
    return paginate(query, this.seasonRepository, {
      where,
      sortableColumns: ['name', 'createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
    })
  }

  async createSeason(season: ICreateSeason, streamId: string ): Promise<SeasonEntity> {
    return this.seasonRepository.save({
      ...season,
      stream: { id: streamId }
    })
  }
}

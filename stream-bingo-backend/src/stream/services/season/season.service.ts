import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import { SeasonEntity } from 'src/stream/entities/season.entity'
import { ICreateSeason } from 'src/stream/poto'
import { Repository } from 'typeorm'

@Injectable()
export class SeasonService {
constructor(
  @InjectRepository(SeasonEntity)
  private readonly seasonRepository: Repository<SeasonEntity>,
){}

  getStreamSeasons(query: PaginateQuery, streamId: string): Promise<Paginated<SeasonEntity>> {
    return paginate(query, this.seasonRepository, {
      where: { stream: {id: streamId}},
      sortableColumns: ['name', 'createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
    })
  }

  // createSeason(input: ICreateSeason){
  //   this.seasonRepository.save()
  // }
}

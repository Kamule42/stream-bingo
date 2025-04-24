import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import { LeaderboardEntity } from 'src/scoring/entities/leaderboard.entitiy'
import { Repository } from 'typeorm'

@Injectable()
export class ScoringService {
  constructor(
    @InjectRepository(LeaderboardEntity)
    private readonly leaderboardRepository: Repository<LeaderboardEntity>,
  ){}

  getLeaderBoardForStream(streamId: string, query: PaginateQuery): Promise<Paginated<LeaderboardEntity>> {
    return paginate(query, this.leaderboardRepository, {
      where : {
        round: { stream: { id: streamId}}
      },
      sortableColumns: ['score', 'username', 'round.name', 'round.stream.name'],
      defaultSortBy: [['score', 'DESC']],
      relations: ['round', 'round.stream']
    })
  }
}

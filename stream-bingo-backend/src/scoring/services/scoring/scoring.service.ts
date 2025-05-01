import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import { LeaderboardEntity } from 'src/scoring/entities/leaderboard.entitiy'
import { StreamLeaderboardEntity } from 'src/scoring/entities/stream-leaderboard.entitiy'
import { Repository } from 'typeorm'

@Injectable()
export class ScoringService {
  constructor(
    @InjectRepository(LeaderboardEntity)
    private readonly leaderboardRepository: Repository<LeaderboardEntity>,
    @InjectRepository(StreamLeaderboardEntity)
    private readonly streamLleaderboardRepository: Repository<StreamLeaderboardEntity>,
  ){}

  getLeaderBoardForStream(streamId: string, query: PaginateQuery): Promise<Paginated<StreamLeaderboardEntity>> {
    return paginate(query, this.streamLleaderboardRepository, {
      where : {
        stream: { id: streamId}
      },
      sortableColumns: ['score', 'username', 'stream.name'],
      defaultSortBy: [['score', 'DESC']],
    })
  }
}

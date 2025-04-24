import { Module } from '@nestjs/common';
import { ScoringGateway } from './gateways/scoring/scoring.gateway';
import { LeaderboardEntity } from './entities/leaderboard.entitiy'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ScoringService } from './services/scoring/scoring.service';
import { UserModule } from 'src/user/user.module'

@Module({
  providers: [ScoringGateway, ScoringService],
  imports: [
    TypeOrmModule.forFeature([ LeaderboardEntity, ]),
    UserModule,
  ],
})
export class ScoringModule {}

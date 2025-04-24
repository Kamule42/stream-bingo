import { LeaderboardEntity } from "src/scoring/entities/leaderboard.entitiy"
import { IScore } from "./score.interface"

export const leaderboardMapper = (entity: LeaderboardEntity): IScore => ({
  userId: entity.userId,
  username: entity.username,
  roundId: entity.round.id,
  streamId: entity.round.stream.id,
  score: entity.score,
})

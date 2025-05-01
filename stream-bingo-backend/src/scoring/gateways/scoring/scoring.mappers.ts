import { LeaderboardEntity } from "src/scoring/entities/leaderboard.entitiy"
import { IScore } from "./score.interface"
import { StreamLeaderboardEntity } from "src/scoring/entities/stream-leaderboard.entitiy"

export const leaderboardMapper = (entity: LeaderboardEntity): IScore => ({
  userId: entity.userId,
  username: entity.username,
  roundId: entity.round.id,
  streamId: entity.round.stream.id,
  score: entity.score,
})

export const streamLeaderboardMapper = (entity: StreamLeaderboardEntity): IScore => ({
  userId: entity.userId,
  username: entity.username,
  streamId: entity.stream?.id,
  score: entity.score,
})

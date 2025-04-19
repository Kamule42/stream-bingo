
export const roundMapper = (round) => ({
  id: round.id,
  name: round.name,
  startAt: round.startAt,
  streamStartAt: round.streamStartAt,
  streamId: round.stream.id,
  streamName: round.stream.name,
  status: round.status
})

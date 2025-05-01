export const roundMapper = round => ({
  id: round.id,
  name: round.name,
  startAt: round.startAt,
  streamStartAt: round.streamStartAt,
  streamId: round.stream.id,
  streamName: round.stream.name,
  status: round.status
})

export const roundDetailMapper = (round) =>
  round == null ? { event: 'noRoundDetail', data: undefined } :
  { event: 'roundDetail', data: roundMapper(round) }

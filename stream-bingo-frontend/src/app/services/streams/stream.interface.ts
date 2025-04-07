export interface IStream{
    id: string,
    name: string,
    twitchId: string,
    urlHandle: string,
    enabled?: boolean,
}

export interface IStreamWithNextRound extends IStream{
    nextStreamStartsAt: Date,
    nextRoundStartsAt: Date,
}

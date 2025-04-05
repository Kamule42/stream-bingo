export interface IStream{
    id: string,
    name: string,
    urlHandle: string,
}

export interface IStreamWithNextRound extends IStream{
    nextStreamStartsAt: Date,
    nextRoundStartsAt: Date,
}

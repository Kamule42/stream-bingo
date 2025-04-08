export interface IStream{
    id: string,
    name: string,
    urlHandle: string,
    enabled?: boolean,
    rights?: Array<{
        right: string,
        user_id: string,
        username: string
    }>,
}

export interface IStreamWithNextRound extends IStream{
    nextStreamStartsAt: Date,
    nextRoundStartsAt: Date,
}

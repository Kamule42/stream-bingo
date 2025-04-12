export interface IRound{
    id: string
    name: string
    startAt: Date,
    streamStartAt: Date,
    streamId?: string
    streamName?: string
}
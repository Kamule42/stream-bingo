export enum RoundStatus{
    CREATED= 'CREATED',
    STARTED= 'STARTED',
    FINISHED= 'FINISHED',
}

export interface IRound{
    id: string
    name: string
    startAt: Date
    streamStartAt: Date
    streamId?: string
    streamName?: string
    status: RoundStatus
}
export enum RoundStatus{
    CREATED= 'CREATED',
    STARTED= 'STARTED',
    FINISHED= 'FINISHED',
}

export interface IRound{
    id: string
    name: string
    streamId?: string
    streamName?: string
    status: RoundStatus
}

export type IEditRound = Omit<IRound, 'status' | 'streamId' | 'streamName'> & { status?: RoundStatus}

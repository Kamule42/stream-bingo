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
    seasonId?: string
    seasonName?: string
    gridSize: number
}

export type IEditRound = Omit<IRound, 'status' | 'streamId' | 'streamName' | 'seasonName'> & { status?: RoundStatus}

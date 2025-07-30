import { RoundStatus } from "src/stream/entities/round.entity"

export interface IRound{
    id: string
    name: string
    streamStartAt?: Date
    status: RoundStatus
    streamId: string
    streamName: string
    seasonId?: string
    seasonName?: string
    gridSize: number
}

export type IRoundEdit = Omit<IRound, 'streamId'|'streamName'|'seasonName'> & { toBeDeleted?: boolean }

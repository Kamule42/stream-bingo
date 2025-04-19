import { RoundStatus } from "src/stream/entities/round.entity"

export interface IRound{
    id: string
    name: string
    startAt: Date
    streamStartAt: Date
    status: RoundStatus
    streamId: string
    streamName: string
}

export type IRoundEdit = Omit<IRound, 'streamId'|'streamName'> & { toBeDeleted?: boolean }

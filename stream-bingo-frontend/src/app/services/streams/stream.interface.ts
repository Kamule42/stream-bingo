import { DateTime } from "luxon"
import { RoundStatus } from "../rounds/round.interface"

export interface IRight{
    right: string
    user_id: string
    username: string
}

export interface IStream<T = IRight>{
    id: string
    name: string
    twitchId: string
    urlHandle: string
    enabled?: boolean
    rights?: T[]
    startAt?: DateTime,
    streamStartAt?: DateTime,
    startAtTxt?: string
    startAtIso?: string
    isFav?: boolean,
    cells?: ICell[],
    status?: RoundStatus,
}


export type RawStream = Omit<IStream, 'startAt'|'streamStartAt'> & {startAt: string, streamStartAt: string}



export interface ICell{
    id: string,
    name: string, 
    description: string,
    active: boolean,
}

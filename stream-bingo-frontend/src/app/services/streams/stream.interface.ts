import { DateTime } from "luxon"

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
    startAt?: DateTime
    startAtTxt?: string
    startAtIso?: string
    isFav?: boolean,
    cells?: ICell[]
}


export interface ICell{
    id: string,
    name: string, 
    description: string,
    active: boolean,
}

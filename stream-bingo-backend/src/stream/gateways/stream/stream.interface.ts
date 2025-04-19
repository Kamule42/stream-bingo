export interface IRight{
    right: string,
    user_id: string,
    username: string,
}

export interface IStream<T = IRight>{
    id: string,
    name: string,
    twitchId: string,
    urlHandle: string,
    enabled?: boolean,
    rights?: Array<T>,
}
export interface INextStream{
    id: string,
    name: string,
    twitchId: string,
    urlHandle: string,
    enabled?: boolean,
    startAt: Date,
}

export interface ICell{
    id: string,
    name: string, 
    description: string,
    active: boolean,
}

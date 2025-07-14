export interface ISeason{
    id: string,
    name: string,
    date: Date
}

export type ICreateSeason = Pick<ISeason,'id' | 'name' >

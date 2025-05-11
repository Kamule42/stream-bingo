export interface IGridCell{
    index: number
    cellName: string
    cellDescription: string
    cellId: string,
    checked?: boolean,
}

export interface IGrid{
    id: string
    streamId: string
    streamName: string
    roundId: string
    roundName: string
    streamStartAt: Date
    cells: IGridCell[]
    score: number
}

export interface IValidatedCell{
    cellId: string
    valide: boolean
}

export type IGridSummary = Pick<IGrid, 'id' | 'streamId' | 'streamName' | 'roundName' | 'streamStartAt'>

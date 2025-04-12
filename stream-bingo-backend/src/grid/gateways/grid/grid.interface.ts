export interface IGridCell{
    index: number
    cellName: string
    cellDescription: string
    cellId: string
}

export interface IGrid{
    id: string
    streamId: string
    streamName: string
    roundId: string
    roundName: string
    streamStartAt: Date
    cells: Array<IGridCell>
}

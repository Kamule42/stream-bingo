import { GridEntity } from "src/grid/entities/grid.entity";
import { IGrid, IGridSummary } from "./grid.interface";

export const gridMapper = (grid: GridEntity): IGrid => ({
    id: grid.id,
    streamId: grid.round.stream.id,
    streamName: grid.round.stream.name,
    roundId: grid.round.id,
    roundName: grid.round.name,
    cells: grid.cells.map(cell => ({
        index: cell.index,
        cellName: cell.cell.name,
        cellDescription: cell.cell.description,
        cellId: cell.cell.id,
        checked: cell.checked,
    }))
})

export const gridSummaryMapper = (grid: GridEntity): IGridSummary => ({
    id: grid.id,
    roundName: grid.round.name,
    streamId: grid.round.stream.id,
    streamName: grid.round.stream.name,
})

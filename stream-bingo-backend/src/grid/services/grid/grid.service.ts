import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import { GridCellEntity } from 'src/grid/entities/grid-cell.entity'
import { GridEntity } from 'src/grid/entities/grid.entity'
import { RoundStatus } from 'src/stream/entities/round.entity'
import { CellService } from 'src/stream/services/cell/cell.service'
import { RoundService } from 'src/stream/services/round/round.service'
import { DeepPartial, IsNull, Repository } from 'typeorm'
import { v7 as uuid } from 'uuid'

@Injectable()
export class GridService {
  constructor(
    @InjectRepository(GridEntity)
    private readonly gridRepository: Repository<GridEntity>,
    private readonly cellService: CellService,
    private readonly roundService: RoundService,
  ) { }

  async getGridForStream(streamId: string, userId?: string, bingoId?: string): Promise<GridEntity | null> {
    let where = {}
    if (userId != null && bingoId != null) {
      where = {
        user: { id: userId },
        id: bingoId,
      }
    }
    else if (userId != null || bingoId != null) {
      const round = await this.roundService.getStreamCurrentRound(streamId)
      if (round?.id == null) {
        return null
      }
      where = {
        round: { id: round.id },
        user: userId ? { id: userId } : IsNull(),
        ...(bingoId != null ? { id: bingoId } : {})
      }
    }
    else {
      throw Error('No bingo to show')
    }
    return this.gridRepository.findOne({
      where: where,
      relations: ['round', 'round.stream', 'cells', 'cells.cell'],
    })
  }

  async createGrid(streamId: string, userId?: string): Promise<GridEntity> {
    const availableCells = await this.cellService.getStreamCells(streamId)
    let cellIds = availableCells
      .filter(({ active }) => active)
      .map(({ id }) => id)
    const round = await this.roundService.getStreamCurrentRound(streamId)
    if (round == null) {
      throw new Error('No active round')
    }
    if(
      round.status !== RoundStatus.CREATED && 
      (userId === undefined || round.status != RoundStatus.STARTED)
    ){
      throw new Error('Cannot create round')
    }
    const gridId = uuid()
    const cells: Array<DeepPartial<GridCellEntity>> = Array.from(Array(16).keys()).map(index => {
      const cellId = cellIds.at(Math.floor(Math.random() * cellIds.length))!
      cellIds = cellIds.filter(id => id != cellId)
      return {
        index,
        cellId,
        gridId,
      }
    })
    await this.gridRepository.save({
      id: gridId,
      locked: false,
      round: { id: round.id },
      cells,
      ...userId ? { user: { id: userId } } : {}
    }, {
      transaction: true
    })
    return this.gridRepository.findOne({
      where: { id: gridId },
      relations: ['round', 'round.stream', 'cells', 'cells.cell']
    }) as Promise<GridEntity>
  }

  getUserGrids(userId: string, query: PaginateQuery): Promise<Paginated<GridEntity>> {
    return paginate(
      query,
      this.gridRepository,
      {
        where: {
          user: { id: userId }
        },
        relations: ['round', 'round.stream'],
        sortableColumns: ['round.name', 'round.stream.name']
      })
  }

  async flipCell(gridId: string, cellIndex: number, userId?: string) {
    const grid = await this.gridRepository.findOne({
      where: { id: gridId },
      relations: ['round', 'round.stream', 'cells', 'cells.cell', 'user'],
    })
    if(
      grid == null ||
      userId != undefined && grid.user == null ||
      userId != grid.user?.id
    ) {
      throw new Error('Unable to edit cell')
    }
    grid.cells = grid.cells.map(cell => {
      if(cell.index === cellIndex){
        return {
          ...cell,
          checked: !cell.checked
        }
      }
      return cell
    })
    await this.gridRepository.save(grid)
    return grid
  }
}

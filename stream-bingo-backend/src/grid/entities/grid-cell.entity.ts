import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm'
import { GridEntity } from './grid.entity'
import { CellEntity } from 'src/stream/entities/cell.entity'

@Entity({ name: 'grid_cells', schema: 'bingo' })
export class GridCellEntity {
    @PrimaryColumn()
    index: number

    @Column()
    checked: boolean

    @PrimaryColumn({name: 'grid_id'})
    gridId: string
    @ManyToOne(() => GridEntity, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'grid_id'})
    grid: GridEntity
    
    @PrimaryColumn({name: 'cell_id'})
    cellId: string
    @ManyToOne(() => CellEntity, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'cell_id'})
    cell: CellEntity

    @Column({ name: 'created_at' })
    createdAt: Date

    @Column({ name: 'updated_at' })
    updatedAt: Date

    @Column({ name: 'deleted_at' })
    deletedAt: Date
}

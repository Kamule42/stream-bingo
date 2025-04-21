import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm'
import { CellEntity } from 'src/stream/entities/cell.entity'
import { RoundEntity } from 'src/stream/entities/round.entity'

@Entity({ name: 'validated_cells', schema: 'bingo' })
export class ValidatedCellEntity {
    @Column()
    valide: boolean

    @PrimaryColumn({name: 'round_id'})
    roundId: string
    @ManyToOne(() => RoundEntity)
    @JoinColumn({name: 'round_id'})
    round: RoundEntity
    
    @PrimaryColumn({name: 'cell_id'})
    cellId: string
    @ManyToOne(() => CellEntity)
    @JoinColumn({name: 'cell_id'})
    cell: CellEntity

    @Column({ name: 'created_at' })
    createdAt: Date

    @Column({ name: 'updated_at' })
    updatedAt: Date

    @Column({ name: 'deleted_at' })
    deletedAt: Date
}

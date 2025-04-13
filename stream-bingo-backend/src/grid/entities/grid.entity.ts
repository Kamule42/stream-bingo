import { RoundEntity } from 'src/stream/entities/round.entity'
import { UserEntity } from 'src/user/entities/user.entity'
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { GridCellEntity } from './grid-cell.entity'

@Entity({ name: 'grids', schema: 'bingo' })
export class GridEntity {
    @PrimaryColumn()
    id: string

    @Column()
    locked: boolean

    @ManyToOne(() => RoundEntity,)
    @JoinColumn({name: 'round_id'})
    round: RoundEntity
    
    @ManyToOne(() => UserEntity)
    @JoinColumn({name: 'user_id'})
    user?: UserEntity

    @OneToMany(() => GridCellEntity, (cell) => cell.grid, { cascade: true, })
    @JoinColumn({name: 'grid_id'})
    cells: Array<GridCellEntity>

    @Column({ name: 'created_at' })
    createdAt: Date

    @Column({ name: 'updated_at' })
    updatedAt: Date

    @Column({ name: 'deleted_at' })
    deletedAt: Date
}

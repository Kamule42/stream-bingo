import { RoundEntity } from 'src/stream/entities/round.entity'
import { UserEntity } from 'src/user/entities/user.entity'
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm'

@Entity({ name: 'grids', schema: 'bingo' })
export class GridEntity {
    @PrimaryColumn()
    id: string

    @Column()
    locked: boolean

    @ManyToOne(() => RoundEntity)
    @JoinColumn({name: 'round_id'})
    round: RoundEntity
  
    @ManyToOne(() => UserEntity)
    @JoinColumn({name: 'user_id'})
    user: UserEntity

    @Column({ name: 'created_at' })
    createdAt: Date

    @Column({ name: 'updated_at' })
    updatedAt: Date

    @Column({ name: 'deleted_at' })
    deletedAt: Date
}

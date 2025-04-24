import { RoundEntity } from "src/stream/entities/round.entity"
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm"


@Entity({ name: 'v_leaderboard', schema: 'bingo' })
export class LeaderboardEntity{
    @PrimaryColumn({name: 'user_id'})
    userId: string

    @Column()
    score: number

    @Column({name: 'username'})
    username: string

    @Column({name: 'grid_id'})
    gridId: string

    @ManyToOne(() => RoundEntity, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'round_id'})
    round: RoundEntity
}
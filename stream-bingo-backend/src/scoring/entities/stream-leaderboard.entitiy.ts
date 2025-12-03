import { SeasonEntity } from "src/stream/entities/season.entity"
import { StreamEntity } from "src/stream/entities/stream.entity"
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm"


@Entity({ name: 'v_stream_leaderboard', schema: 'bingo' })
export class StreamLeaderboardEntity{
    @PrimaryColumn({name: 'user_id'})
    userId: string

    @Column()
    score: number

    @Column({name: 'username'})
    username: string

    @ManyToOne(() => StreamEntity, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'stream_id'})
    stream: StreamEntity

    @ManyToOne(() => SeasonEntity, { onDelete: 'CASCADE' })
    @JoinColumn({name: 'season_id'})
    season: SeasonEntity
}
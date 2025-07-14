import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { StreamEntity } from './stream.entity'
import { RoundEntity } from './round.entity'


@Entity({ name: 'seasons', schema: 'bingo' })
export class SeasonEntity {
  @PrimaryColumn()
  id: string

  @Column()
  name: string

  @ManyToOne(() => StreamEntity, (stream) => stream.rounds, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({name: 'stream_id'})
  stream: StreamEntity
  
  @OneToMany(() => RoundEntity, (round) => round.season,)
  @JoinColumn({name: 'season_id'})
  rounds: Array<RoundEntity>

  @Column({ name: 'created_at' })
  createdAt: Date

  @Column({ name: 'updated_at' })
  updatedAt: Date

  @Column({ name: 'deleted_at' })
  deletedAt: Date
}

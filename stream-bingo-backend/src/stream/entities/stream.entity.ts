import { Entity, Column, PrimaryColumn, OneToMany, JoinColumn } from 'typeorm'
import { RoundEntity } from './round.entity'

@Entity({ name: 'streams', schema: 'bingo' })
export class StreamEntity {
  @PrimaryColumn()
  id: string

  @Column()
  name: string

  @Column({ name: 'twitch_login' })
  twitchLogin: string

  @Column({ name: 'twitch_id' })
  twitchId: string

  @Column()
  enabled: boolean

  @Column({ name: 'created_at' })
  createdAt: Date

  @Column({ name: 'updated_at' })
  updatedAt: Date

  @Column({ name: 'deleted_at' })
  deletedAt: Date

  @OneToMany(() => RoundEntity, (round) => round.stream)
  @JoinColumn({name: 'stream_id'})
  rounds: RoundEntity[]
}

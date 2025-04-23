import { Entity, Column, PrimaryColumn, } from 'typeorm'
import { RoundStatus } from './round.entity'

@Entity({ name: 'v_next_streams', schema: 'bingo' })
export class NextStreamEntity {
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

  @Column({ name: 'start_at'})
  startAt: Date
  
  @Column({ name: 'stream_start_at'})
  streamStartAt: Date

  @Column()
  status: RoundStatus
}

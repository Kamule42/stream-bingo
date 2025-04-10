import { Entity, Column, PrimaryColumn, } from 'typeorm'

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
}

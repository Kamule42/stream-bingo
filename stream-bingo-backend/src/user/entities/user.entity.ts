import { Entity, Column, PrimaryColumn, Index, OneToMany, JoinColumn } from 'typeorm'
import { RightEntity } from './rights.entity'

@Entity({ name: 'users', schema: 'bingo' })
export class UserEntity {
  @PrimaryColumn()
  id: string

  @Column({ name: 'discord_id' })
  @Index()
  discordId: string

  @Column({ name: 'discord_username' })
  discordUsername: string

  @Column({ name: 'discord_avatar' })
  discordAvatar: string

  @OneToMany(() => RightEntity, (right) => right.user)
  @JoinColumn({name: 'user_id'})
  rights: Array<RightEntity>
}

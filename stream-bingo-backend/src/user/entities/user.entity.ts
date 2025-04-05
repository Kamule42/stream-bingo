import { Entity, Column, PrimaryColumn, Index } from 'typeorm'

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
}

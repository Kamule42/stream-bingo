import { Entity, Column, PrimaryColumn, Index, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm'
import { RightEntity } from './right.entity'
import { StreamEntity } from 'src/stream/entities/stream.entity'

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

  @OneToMany(() => RightEntity, (right) => right.user,)
  @JoinColumn({name: 'user_id'})
  rights: Array<RightEntity>

  @ManyToMany(() => StreamEntity)
  @JoinTable({
    schema: 'bingo',
    name: 'favs',
    joinColumn: {
      name: 'user_id'
    },
    inverseJoinColumn: {
      name: 'stream_id'
    }
  })
  favs: Array<StreamEntity>
}

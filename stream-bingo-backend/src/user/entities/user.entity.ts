import { Entity, Column, PrimaryColumn, Index, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm'
import { RightEntity } from './right.entity'
import { StreamEntity } from 'src/stream/entities/stream.entity'
import { ProviderEntity } from './provider.entity'

@Entity({ name: 'users', schema: 'bingo' })
export class UserEntity {
  @PrimaryColumn()
  id: string

  @Column({ name: 'username', })
  username: string
  
  @Column({ name: 'avatar_provider', })
  avatarProvider: string

  @OneToMany(() => ProviderEntity, (provider) => provider.user, {cascade: true})
  @JoinColumn({name: 'user_id'})
  providers: Array<ProviderEntity>

  @OneToMany(() => RightEntity, (right) => right.user, {cascade: true})
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

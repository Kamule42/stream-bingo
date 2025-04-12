import { Entity, Column, PrimaryColumn, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm'
import { RoundEntity } from './round.entity'
import { RightEntity } from 'src/user/entities/right.entity'
import { CellEntity } from 'src/user/entities/cell.entity'
import { UserEntity } from 'src/user/entities/user.entity'

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

  @OneToMany(() => RoundEntity, (round) => round.stream, { cascade: true })
  @JoinColumn({name: 'stream_id'})
  rounds: Array<RoundEntity>

  @OneToMany(() => RightEntity, (right) => right.stream, { cascade: true })
  @JoinColumn({name: 'stream_id'})
  rights: Array<RightEntity>

  @ManyToMany(() => UserEntity)
  @JoinTable({
    schema: 'bingo',
    name: 'favs',
    joinColumn: {
      name: 'stream_id'
    },
    inverseJoinColumn: {
      name: 'user_id'
    }
  })
  favBy: Array<UserEntity>

  @OneToMany(() => CellEntity, (cell) => cell.stream, { cascade: true })
  @JoinColumn({name: 'stream_id'})
  cells: Array<CellEntity>
}

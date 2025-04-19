import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm'
import { StreamEntity } from './stream.entity'

export enum RoundStatus{
  CREATED= 'CREATED',
  STARTED= 'STARTED',
  FINISHED= 'FINISHED',
}

@Entity({ name: 'rounds', schema: 'bingo' })
export class RoundEntity {
  @PrimaryColumn()
  id: string

  @Column()
  name: string

  @Column({ name: 'start_at' })
  startAt: Date

  @Column({ name: 'stream_start_at' })
  streamStartAt: Date

  @Column({ 
    enum: RoundStatus,
    default: RoundStatus.CREATED,
  })
  status: RoundStatus

  @ManyToOne(() => StreamEntity, (stream) => stream.rounds)
  @JoinColumn({name: 'stream_id'})
  stream: StreamEntity

  @Column({ name: 'created_at' })
  createdAt: Date

  @Column({ name: 'updated_at' })
  updatedAt: Date

  @Column({ name: 'deleted_at' })
  deletedAt: Date
}

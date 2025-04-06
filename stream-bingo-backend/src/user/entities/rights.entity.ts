import { StreamEntity } from 'src/stream/entities/stream.entity'
import { Entity, Column, ManyToOne, JoinColumn, Index, PrimaryColumn } from 'typeorm'
import { UserEntity } from './user.entity'

@Entity({ name: 'rights', schema: 'bingo' })
@Index(["user", "stream", "rightKey"], {unique: true})
export class RightEntity {
    @PrimaryColumn({ name: 'right_key' })
    rightKey: string

    @ManyToOne(() => UserEntity, (user) => user.rights)
    @JoinColumn({name: 'user_id'})
    user: UserEntity

    @ManyToOne(() => StreamEntity)
    @JoinColumn({name: 'stream_id'})
    stream?: StreamEntity
}

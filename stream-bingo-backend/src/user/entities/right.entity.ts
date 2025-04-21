import { StreamEntity } from 'src/stream/entities/stream.entity'
import { Entity, ManyToOne, JoinColumn, Index, PrimaryColumn } from 'typeorm'
import { UserEntity } from './user.entity'

@Entity({ name: 'rights', schema: 'bingo' })
@Index(["user", "stream", "rightKey"], {unique: true})
export class RightEntity {
    @PrimaryColumn({ name: 'right_key' })
    rightKey: string

    @ManyToOne(() => UserEntity, (user) => user.rights, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({name: 'user_id'})
    user: UserEntity

    @ManyToOne(() => StreamEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({name: 'stream_id'})
    stream?: StreamEntity
}

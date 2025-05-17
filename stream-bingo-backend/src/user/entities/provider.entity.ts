import { Entity, ManyToOne, JoinColumn, Index, PrimaryColumn, Column } from 'typeorm'
import { UserEntity } from './user.entity'

@Entity({ name: 'authentication', schema: 'bingo' })
@Index(["user", "provider"], {unique: true})
export class ProviderEntity {
    @PrimaryColumn({ name: 'provider' })
    provider: string

    @Column({name: 'reference'})
    reference: string

    @Column({name: 'avatar_reference'})
    avatarReference: string

    @ManyToOne(() => UserEntity, (user) => user.rights, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({name: 'user_id'})
    user: UserEntity
}

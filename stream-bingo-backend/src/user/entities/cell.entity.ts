import { StreamEntity } from "src/stream/entities/stream.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";


@Entity({ name: 'cells', schema: 'bingo' })
export class CellEntity{
    @PrimaryColumn()
    id: string

    @Column()
    name: string

    @Column()
    description: string

    @Column()
    active: boolean

    @ManyToOne(() => StreamEntity)
    @JoinColumn({name: 'stream_id'})
    stream?: StreamEntity
}
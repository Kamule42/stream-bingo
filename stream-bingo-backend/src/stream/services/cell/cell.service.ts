import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ICell } from 'src/stream/gateways/stream/stream.interface'
import { CellEntity } from 'src/stream/entities/cell.entity'
import { Repository } from 'typeorm'

@Injectable()
export class CellService {
    constructor(
        @InjectRepository(CellEntity)
        private readonly cellRepository: Repository<CellEntity>,
    ){}

    getStreamCells(id: string): Promise<Array<CellEntity>> {
        return this.cellRepository.find({
            where: { stream: { id} }
        })
    }

    async updateCells(id: string, cells: Array<ICell>){
        await this.cellRepository.upsert(cells.map(cell => ({
            ...cell,
            stream: { id }
        })), ['id'])
        await this.cellRepository.createQueryBuilder()
            .delete()
            .from(CellEntity)
            .where('id not in(:...ids) and stream_id = :stream_id', {
                stream_id: id,
                ids: cells.map(cell => cell.id)
            })
            .execute()
    }
    findOne(id: string): Promise<CellEntity | null> {
        return this.cellRepository.findOne({
            where: {id},
            relations: ['stream']
        })
    }
}

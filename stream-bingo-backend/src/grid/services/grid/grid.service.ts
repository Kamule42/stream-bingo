import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { GridEntity } from 'src/grid/entities/grid.entity'
import { MoreThanOrEqual, Repository } from 'typeorm'

@Injectable()
export class GridService {

    constructor(
        @InjectRepository(GridEntity)
        private readonly gridRepository: Repository<GridEntity>,
    ){}

    getGridForStream(streamId: string, userId: string): Promise<GridEntity | null> {
        return this.gridRepository.findOne({
            where: {
                round: {
                    stream: { id: streamId },
                    streamStartAt: MoreThanOrEqual(new Date())
                },
                user: {
                    id: userId,
                },
            },
            relations: ['round', 'round.stream'],
            order: {
                round: {
                    streamStartAt: 'ASC'
                }
            },
        })
    }
}

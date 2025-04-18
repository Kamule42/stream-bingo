import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { RoundEntity } from 'src/stream/entities/round.entity';
import { IRoundEdit } from 'src/stream/gateways/round/round.interface';
import { MoreThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class RoundService {
    constructor(
        @InjectRepository(RoundEntity)
        private readonly roundRepository: Repository<RoundEntity>,
    ) { }

    getStreamCurrentRound(streamId: string): Promise<RoundEntity | null> {
        return this.roundRepository.findOne({
            where: {
                stream: { id: streamId },
                streamStartAt: MoreThanOrEqual(DateTime.now().minus({hours: 3}).toJSDate())
            },
            relations: [ 'stream' ],
            order:{
                streamStartAt: 'asc'
            },
        })
    }

    getStreamRounds(streamId: string): Promise<Array<RoundEntity>> {
        return this.roundRepository.find({
            where: {
                stream: { id: streamId },
                streamStartAt: MoreThanOrEqual(DateTime.now().minus({hours: 3}).toJSDate())
            },
            relations: [ 'stream' ],
            order:{
                streamStartAt: 'asc'
            }
        })
    }

    updateStreamRounds(streamId: string, rounds: IRoundEdit[]) {
        this.roundRepository.upsert(
            rounds
            .filter(({toBeDeleted}) => toBeDeleted !== true)
            .map(round => ({
                id: round.id,
                name: round.name,
                startAt: round.startAt,
                streamStartAt: round.streamStartAt,
                stream: {id: streamId },
            })),
        ['id'])
    }
}

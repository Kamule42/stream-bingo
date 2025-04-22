import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { RoundEntity, RoundStatus } from 'src/stream/entities/round.entity';
import { IRoundEdit } from 'src/stream/gateways/round/round.interface';
import { Brackets, IsNull, MoreThanOrEqual, Repository } from 'typeorm';

type NewStatus = null | {newStatus: RoundStatus, delay: boolean }

@Injectable()
export class RoundService {
  constructor(
    @InjectRepository(RoundEntity)
    private readonly roundRepository: Repository<RoundEntity>,
  ) { }

  getRound(roundId: string) {
    return this.roundRepository.findOne({
      where: { id: roundId},
      relations: ['stream']
    })
  }
  getStreamCurrentRound(streamId: string): Promise<RoundEntity | null> {
    return this.roundRepository.createQueryBuilder('round')
      .addSelect(`
                CASE
                    WHEN round.status='STARTED' THEN 0
                    ELSE 1
                END as statusOrder
            `)
      .leftJoinAndSelect('round.stream', 'stream')
      .where('round.stream.id=:streamId', { streamId })
      .andWhere(new Brackets((qb) => {
        qb
          .where('round.streamStartAt >= :date', { date: DateTime.now().minus({ hours: 3 }).toJSDate() })
          .orWhere('round.status = :status', { status: RoundStatus.STARTED })
      }))
      .orderBy('statusOrder', 'ASC')
      .addOrderBy('round.streamStartAt', 'ASC')
      .getOne()
  }
  getRoundForGrid(gridId: string, userId: string | undefined) {
    let where = {}
    return this.roundRepository.findOne({
      where: {
        grids: { 
          id: gridId,
          user : userId ? { id : userId } : IsNull(),
        }
      },
      relations: ['stream']
    })
  }

  getStreamRounds(streamId: string): Promise<Array<RoundEntity>> {
    return this.roundRepository.find({
      where: [
          { stream: { id: streamId }, streamStartAt: MoreThanOrEqual(DateTime.now().minus({ hours: 3 }).toJSDate()) },
          { stream: { id: streamId }, status: RoundStatus.STARTED }
      ],
      relations: ['stream'],
      order: {
        streamStartAt: 'asc'
      }
    })
  }

  updateStreamRounds(streamId: string, rounds: IRoundEdit[], toDelete?: string[]) {
    this.roundRepository.upsert(
      rounds
        .filter(({ toBeDeleted }) => toBeDeleted !== true)
        .map(round => ({
          id: round.id,
          name: round.name,
          startAt: round.startAt,
          streamStartAt: round.streamStartAt,
          stream: { id: streamId },
        })),
      ['id'])
      if((toDelete?.length ?? 0) > 0){
        this.roundRepository.createQueryBuilder()
          .delete()
          .where('id in (:...ids) and stream.id=:streamId', {
            ids: toDelete,
            streamId,
          })
          .execute()
      }
  }

  async streamRoundStatus(streamId: string, status: RoundStatus) {
    const round = await this.getStreamCurrentRound(streamId)
    if(round === null){
      throw new Error('Unknown round')
    }
    const roundStatus = round.status
    const newStatus = this.getFilteredRoundStatus(roundStatus, status)
    if(newStatus == null){ // Nothing to do
      return null
    }
    this.roundRepository.update(
      { id: round.id}, 
      {status: newStatus.newStatus }
    )
    return { ...round, status: newStatus.newStatus }
  }

  private getFilteredRoundStatus(roundStatus: RoundStatus, newStatus: RoundStatus): NewStatus{
    switch(roundStatus){
      case RoundStatus.CREATED: return this.getCreatedRoundStatus(newStatus)
      case RoundStatus.STARTED: return this.getStartedRoundStatus(newStatus)
      case RoundStatus.FINISHED: return this.getFinishedRoundStatus(newStatus)
    }
  }

  private getCreatedRoundStatus(newStatus: RoundStatus): NewStatus{
    switch(newStatus){
      case RoundStatus.CREATED: return null
      case RoundStatus.STARTED: return  { newStatus, delay: false}
    }
    throw new Error('Illegal status update')
  }
  private getStartedRoundStatus(newStatus: RoundStatus): NewStatus{
    switch(newStatus){
      case RoundStatus.CREATED: return { newStatus, delay: false}
      case RoundStatus.STARTED: return null
      case RoundStatus.FINISHED: return { newStatus, delay: true}
    }
  }
  private getFinishedRoundStatus(newStatus: RoundStatus): NewStatus{
    switch(newStatus){
      case RoundStatus.STARTED: return { newStatus, delay: false}
      case RoundStatus.FINISHED: return null
    }
    throw new Error('Illegal status update')
  }
}

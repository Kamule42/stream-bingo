import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { RoundEntity, RoundStatus } from 'src/stream/entities/round.entity';
import { IRoundEdit } from 'src/stream/gateways/round/round.interface';
import { Brackets, DataSource, IsNull, MoreThanOrEqual, Repository } from 'typeorm';

type NewStatus = null | {newStatus: RoundStatus, delay: boolean }

@Injectable()
export class RoundService {
  constructor(
    @InjectRepository(RoundEntity)
    private readonly roundRepository: Repository<RoundEntity>,
    private readonly dataSource: DataSource,
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
    if(newStatus.newStatus === RoundStatus.FINISHED){
      this.scoreGridsForRound(round.id)
    }
    return { ...round, status: newStatus.newStatus }
  }

  private scoreGridsForRound(roundId: string) {
    this.dataSource.query(
      `
      UPDATE bingo.grids g
        SET score = score.score
        FROM (SELECT
          g.id,
          (
            -- COLS
            FLOOR(COUNT(gc.cell_id) FILTER (WHERE MOD(gc.index, 4) = 0) / 4) +
            FLOOR(COUNT(gc.cell_id) FILTER (WHERE MOD(gc.index, 4) = 1) / 4) +
            FLOOR(COUNT(gc.cell_id) FILTER (WHERE MOD(gc.index, 4) = 2) / 4) +
            FLOOR(COUNT(gc.cell_id) FILTER (WHERE MOD(gc.index, 4) = 3) / 4) +
            -- ROWS
            FLOOR(COUNT(gc.cell_id) FILTER (WHERE FLOOR(gc.index / 4) = 0) / 4) +
            FLOOR(COUNT(gc.cell_id) FILTER (WHERE FLOOR(gc.index / 4) = 1) / 4) +
            FLOOR(COUNT(gc.cell_id) FILTER (WHERE FLOOR(gc.index / 4) = 2) / 4) +
            FLOOR(COUNT(gc.cell_id) FILTER (WHERE FLOOR(gc.index / 4) = 3) / 4) +
            -- Diag down
            FLOOR(COUNT(gc.cell_id) FILTER (WHERE MOD(gc.index, 5) = 0) / 4) +
            -- Diag up
            FLOOR(COUNT(gc.cell_id) FILTER (WHERE MOD(gc.index, 3) = 0 AND gc.index between 1 and 15) / 4)
          ) as score
        FROM bingo.grids g
        JOIN bingo.grid_cells gc ON gc.grid_id = g.id
        JOIN bingo.validated_cells vc ON vc.cell_id = gc.cell_id  AND vc.valide is true AND vc.round_id = g.round_id
      WHERE g.round_id = $1
        GROUP BY g.id
        ) score
        WHERE
      score.id = g.id AND
      g.user_id IS NOT NULL AND
	  	g.round_id = $1
    `, [roundId]) 
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

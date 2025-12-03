import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatedCellEntity } from 'src/grid/entities/validated-cells.entity';
import { CellService } from 'src/stream/services/cell/cell.service';
import { RoundService } from 'src/stream/services/round/round.service';
import { Repository } from 'typeorm';

@Injectable()
export class ValidatedCellsService {

    constructor(
        @InjectRepository(ValidatedCellEntity)
        private readonly validatedCellsRepository: Repository<ValidatedCellEntity>,
        private readonly roundService: RoundService,
        private readonly cellService: CellService
    ){}

    async flipCell(roundId: string, cellId: string, value: boolean): Promise<Array<ValidatedCellEntity>> {
        const round = await this.roundService.getRound(roundId)
        if(!round){
          throw new Error(`No active round for the round ${roundId}`)
        }
        const cell = await this.cellService.findOne(cellId)
        if(cell == null || cell.stream?.id !== round.stream.id ){
            throw new Error('Cell not found')
        }

        await this.validatedCellsRepository.save({
            round: { id: round.id },
            cell: { id: cell.id },
            valide: value
        })
        return this.getValidatedCellsForRound(round.id)
    }

    async getValidatedCellsForStream(streamId: string): Promise<Array<ValidatedCellEntity>>{
        const round = await this.roundService.getStreamCurrentRound(streamId)
        if(round == null){
            throw new Error('Unknown round')
        }
        return this.getValidatedCellsForRound(round.id)
    }
    async getValidatedCellsForRound(roundId: string): Promise<Array<ValidatedCellEntity>>{
        return this.validatedCellsRepository.find({
            where: {
                round: { id: roundId },
                valide: true,
            }
        })
    }
}

import { Module } from '@nestjs/common';
import { GridGateway } from './gateways/grid/grid.gateway';
import { GridService } from './services/grid/grid.service';
import { UserModule } from 'src/user/user.module';
import { GridEntity } from './entities/grid.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreamModule } from 'src/stream/stream.module';
import { GridCellEntity } from './entities/grid-cell.entity';
import { ValidatedCellEntity } from './entities/validated-cells.entity';
import { ValidatedCellsService } from './services/validated-cells/validated-cells.service';

@Module({
  providers: [GridGateway, GridService, ValidatedCellsService],
  imports: [
    TypeOrmModule.forFeature([GridCellEntity, GridEntity, ValidatedCellEntity, ], ),
    UserModule,
    StreamModule,
  ]
})
export class GridModule {}

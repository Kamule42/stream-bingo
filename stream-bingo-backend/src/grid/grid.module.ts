import { Module } from '@nestjs/common';
import { GridGateway } from './gateways/grid/grid.gateway';
import { GridService } from './services/grid/grid.service';
import { UserModule } from 'src/user/user.module';
import { GridEntity } from './entities/grid.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreamModule } from 'src/stream/stream.module';
import { GridCellEntity } from './entities/grid-cell.entity';

@Module({
  providers: [GridGateway, GridService],
  imports: [
    TypeOrmModule.forFeature([GridCellEntity, GridEntity], ),
    UserModule,
    StreamModule,
  ]
})
export class GridModule {}

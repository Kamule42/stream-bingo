import { Module } from '@nestjs/common';
import { StreamController } from './controllers/stream/stream.controller';
import { StreamGateway } from './gateways/stream/stream.gateway';
import { StreamService } from './services/stream/stream.service';
import { StreamEntity } from './entities/stream.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoundEntity } from './entities/round.entity';
import { UserModule } from 'src/user/user.module';
import { NextStreamEntity } from './entities/next-stream.entity';
import { CellService } from './services/cell/cell.service';
import { CellEntity } from 'src/user/entities/cell.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StreamEntity, RoundEntity, NextStreamEntity, CellEntity,]),
    UserModule,
  ],
  controllers: [StreamController],
  providers: [StreamGateway, StreamService, CellService]
})
export class StreamModule {}

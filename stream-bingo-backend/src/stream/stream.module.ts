import { Module } from '@nestjs/common'
import { StreamController } from './controllers/stream/stream.controller'
import { StreamGateway } from './gateways/stream/stream.gateway'
import { StreamService } from './services/stream/stream.service'
import { StreamEntity } from './entities/stream.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RoundEntity } from './entities/round.entity'
import { UserModule } from 'src/user/user.module'
import { NextStreamEntity } from './entities/next-stream.entity'
import { CellService } from './services/cell/cell.service'
import { CellEntity } from 'src/stream/entities/cell.entity'
import { RoundService } from './services/round/round.service'
import { RoundGateway } from './gateways/round/round.gateway'
import { SeasonEntity } from './entities/season.entity'
import { SeasonService } from './services/season/season.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ StreamEntity, RoundEntity, NextStreamEntity, CellEntity, SeasonEntity ]),
    UserModule,
  ],
  controllers: [ StreamController, ],
  providers: [ StreamGateway, StreamService, CellService, RoundService, RoundGateway, SeasonService, ],
  exports: [ StreamService, CellService, RoundService ]
})
export class StreamModule {}

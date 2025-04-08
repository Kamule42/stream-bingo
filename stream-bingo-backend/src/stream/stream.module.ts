import { Module } from '@nestjs/common';
import { StreamController } from './controllers/stream/stream.controller';
import { StreamGateway } from './gateways/stream/stream.gateway';
import { StreamService } from './services/stream/stream.service';
import { StreamEntity } from './entities/stream.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoundEntity } from './entities/round.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StreamEntity, RoundEntity,]),
    UserModule,
  ],
  controllers: [StreamController],
  providers: [StreamGateway, StreamService]
})
export class StreamModule {}

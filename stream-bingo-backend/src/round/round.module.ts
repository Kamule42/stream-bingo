import { Module } from '@nestjs/common';
import { RoundGateway } from './gateway/round/round.gateway';
import { RoundService } from './services/round/round.service';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [RoundGateway, RoundService],
  imports: [
    UserModule
  ]
})
export class RoundModule {}

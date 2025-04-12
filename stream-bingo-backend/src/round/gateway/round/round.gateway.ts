import { UseGuards } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { RoundService } from 'src/round/services/round/round.service';
import { Roles } from 'src/shared/decorators/auth/roles.decorator';
import { AuthGuard } from 'src/shared/guards/auth/auth.guard';

@WebSocketGateway({
  namespace: 'rounds',
  transports: ['websocket', 'polling']
})
@UseGuards(AuthGuard)
export class RoundGateway {
  constructor(
    private readonly roundService: RoundService
  ){}

  @Roles(['a'])
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}

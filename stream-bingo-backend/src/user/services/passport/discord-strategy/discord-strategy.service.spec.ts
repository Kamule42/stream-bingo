import { Test, TestingModule } from '@nestjs/testing';
import { DiscordStrategy } from './discord-strategy.service';

describe('DiscordStrategyService', () => {
  let service: DiscordStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordStrategy],
    }).compile();

    service = module.get<DiscordStrategy>(DiscordStrategy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

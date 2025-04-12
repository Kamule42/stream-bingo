import { Test, TestingModule } from '@nestjs/testing';
import { RoundGateway } from './round.gateway';

describe('RoundGateway', () => {
  let gateway: RoundGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoundGateway],
    }).compile();

    gateway = module.get<RoundGateway>(RoundGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

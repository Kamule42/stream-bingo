import { Test, TestingModule } from '@nestjs/testing';
import { GridGateway } from './grid.gateway';

describe('GridGateway', () => {
  let gateway: GridGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GridGateway],
    }).compile();

    gateway = module.get<GridGateway>(GridGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

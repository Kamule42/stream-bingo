import { Test, TestingModule } from '@nestjs/testing';
import { ValidatedCellsService } from './validated-cells.service';

describe('ValidatedCellsService', () => {
  let service: ValidatedCellsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidatedCellsService],
    }).compile();

    service = module.get<ValidatedCellsService>(ValidatedCellsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

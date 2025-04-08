import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { hasRightGuard } from './has-right.guard';

describe('hasRightGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => hasRightGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

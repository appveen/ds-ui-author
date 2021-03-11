import { TestBed } from '@angular/core/testing';

import { InsightsGuard } from './insights.guard';

describe('InsightsGuard', () => {
  let guard: InsightsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(InsightsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

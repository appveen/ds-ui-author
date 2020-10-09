import { TestBed, async, inject } from '@angular/core/testing';

import { EntityGuard } from './entity.guard';

describe('EntityGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntityGuard]
    });
  });

  it('should ...', inject([EntityGuard], (guard: EntityGuard) => {
    expect(guard).toBeTruthy();
  }));
});

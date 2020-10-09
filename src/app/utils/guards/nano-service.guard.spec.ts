import { TestBed, async, inject } from '@angular/core/testing';

import { NanoServiceGuard } from './nano-service.guard';

describe('NanoServiceGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NanoServiceGuard]
    });
  });

  it('should ...', inject([NanoServiceGuard], (guard: NanoServiceGuard) => {
    expect(guard).toBeTruthy();
  }));
});

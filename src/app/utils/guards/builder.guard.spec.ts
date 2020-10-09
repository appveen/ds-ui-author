import { TestBed, async, inject } from '@angular/core/testing';

import { BuilderGuard } from './builder.guard';

describe('BuilderGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BuilderGuard]
    });
  });

  it('should ...', inject([BuilderGuard], (guard: BuilderGuard) => {
    expect(guard).toBeTruthy();
  }));
});

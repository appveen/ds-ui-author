import { TestBed, async, inject } from '@angular/core/testing';

import { DataFormatGuard } from './data-format.guard';

describe('DataFormatGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataFormatGuard]
    });
  });

  it('should ...', inject([DataFormatGuard], (guard: DataFormatGuard) => {
    expect(guard).toBeTruthy();
  }));
});

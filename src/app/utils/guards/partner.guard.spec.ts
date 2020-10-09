import { TestBed, async, inject } from '@angular/core/testing';

import { PartnerGuard } from './partner.guard';

describe('PartnerGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PartnerGuard]
    });
  });

  it('should ...', inject([PartnerGuard], (guard: PartnerGuard) => {
    expect(guard).toBeTruthy();
  }));
});

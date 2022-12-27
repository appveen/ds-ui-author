import { TestBed } from '@angular/core/testing';

import { B2bFlowService } from './b2b-flow.service';

describe('B2bFlowService', () => {
  let service: B2bFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(B2bFlowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

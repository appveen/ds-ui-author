import { TestBed } from '@angular/core/testing';

import { B2bPathService } from './b2b-path.service';

describe('B2bPathService', () => {
  let service: B2bPathService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(B2bPathService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

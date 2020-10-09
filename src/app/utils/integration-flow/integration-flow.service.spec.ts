import { TestBed } from '@angular/core/testing';

import { IntegrationFlowService } from './integration-flow.service';

describe('IntegrationFlowService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IntegrationFlowService = TestBed.get(IntegrationFlowService);
    expect(service).toBeTruthy();
  });
});

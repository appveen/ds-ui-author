import { TestBed, async, inject } from '@angular/core/testing';

import { AgentGuard } from './agent.guard';

describe('AgentGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AgentGuard]
    });
  });

  it('should ...', inject([AgentGuard], (guard: AgentGuard) => {
    expect(guard).toBeTruthy();
  }));
});

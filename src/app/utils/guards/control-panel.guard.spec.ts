import { TestBed, async, inject } from '@angular/core/testing';

import { ControlPanelGuard } from './control-panel.guard';

describe('ControlPanelGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ControlPanelGuard]
    });
  });

  it('should ...', inject([ControlPanelGuard], (guard: ControlPanelGuard) => {
    expect(guard).toBeTruthy();
  }));
});

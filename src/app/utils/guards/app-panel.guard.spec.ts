import { TestBed, async, inject } from '@angular/core/testing';

import { AppPanelGuard } from './app-panel.guard';

describe('AppPanelGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppPanelGuard]
    });
  });

  it('should ...', inject([AppPanelGuard], (guard: AppPanelGuard) => {
    expect(guard).toBeTruthy();
  }));
});

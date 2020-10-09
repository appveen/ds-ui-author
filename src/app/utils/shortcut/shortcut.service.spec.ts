import { TestBed, inject } from '@angular/core/testing';

import { ShortcutService } from './shortcut.service';

describe('ShortcutService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ShortcutService]
    });
  });

  it('should be created', inject([ShortcutService], (service: ShortcutService) => {
    expect(service).toBeTruthy();
  }));
});

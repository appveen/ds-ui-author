import { TestBed, async, inject } from '@angular/core/testing';

import { BotGuard } from './bot.guard';

describe('BotGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BotGuard]
    });
  });

  it('should ...', inject([BotGuard], (guard: BotGuard) => {
    expect(guard).toBeTruthy();
  }));
});

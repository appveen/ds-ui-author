import { TestBed, async, inject } from '@angular/core/testing';

import { BookmarkGuard } from './bookmark.guard';

describe('BookmarkGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BookmarkGuard]
    });
  });

  it('should ...', inject([BookmarkGuard], (guard: BookmarkGuard) => {
    expect(guard).toBeTruthy();
  }));
});

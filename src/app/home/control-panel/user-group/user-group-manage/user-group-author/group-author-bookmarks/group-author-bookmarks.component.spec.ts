import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAuthorBookmarksComponent } from './group-author-bookmarks.component';

describe('GroupAuthorBookmarksComponent', () => {
  let component: GroupAuthorBookmarksComponent;
  let fixture: ComponentFixture<GroupAuthorBookmarksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAuthorBookmarksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAuthorBookmarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

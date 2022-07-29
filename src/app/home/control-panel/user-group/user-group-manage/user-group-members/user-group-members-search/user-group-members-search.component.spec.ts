import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGroupMembersSearchComponent } from './user-group-members-search.component';

describe('UserGroupMembersSearchComponent', () => {
  let component: UserGroupMembersSearchComponent;
  let fixture: ComponentFixture<UserGroupMembersSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserGroupMembersSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGroupMembersSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

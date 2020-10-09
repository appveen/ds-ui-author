import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGroupMembersComponent } from './user-group-members.component';

describe('UserGroupMembersComponent', () => {
  let component: UserGroupMembersComponent;
  let fixture: ComponentFixture<UserGroupMembersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserGroupMembersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGroupMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

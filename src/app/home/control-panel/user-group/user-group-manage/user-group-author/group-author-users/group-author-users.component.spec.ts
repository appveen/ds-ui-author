import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAuthorUsersComponent } from './group-author-users.component';

describe('GroupAuthorUsersComponent', () => {
  let component: GroupAuthorUsersComponent;
  let fixture: ComponentFixture<GroupAuthorUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAuthorUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAuthorUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

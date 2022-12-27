import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGroupUsersComponent } from './user-group-users.component';

describe('UserGroupUsersComponent', () => {
  let component: UserGroupUsersComponent;
  let fixture: ComponentFixture<UserGroupUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserGroupUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGroupUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

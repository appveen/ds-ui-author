import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGroupManageComponent } from './user-group-manage.component';

describe('UserGroupManageComponent', () => {
  let component: UserGroupManageComponent;
  let fixture: ComponentFixture<UserGroupManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserGroupManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGroupManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

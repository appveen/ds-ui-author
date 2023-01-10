import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGroupBotsComponent } from './user-group-bots.component';

describe('UserGroupBotsComponent', () => {
  let component: UserGroupBotsComponent;
  let fixture: ComponentFixture<UserGroupBotsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserGroupBotsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGroupBotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

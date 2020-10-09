import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGroupAppcenterComponent } from './user-group-appcenter.component';

describe('UserGroupAppcenterComponent', () => {
  let component: UserGroupAppcenterComponent;
  let fixture: ComponentFixture<UserGroupAppcenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserGroupAppcenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGroupAppcenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

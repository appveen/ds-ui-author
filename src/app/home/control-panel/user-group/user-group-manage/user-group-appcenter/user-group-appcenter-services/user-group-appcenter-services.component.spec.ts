import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGroupAppcenterServicesComponent } from './user-group-appcenter-services.component';

describe('UserGroupAppcenterServicesComponent', () => {
  let component: UserGroupAppcenterServicesComponent;
  let fixture: ComponentFixture<UserGroupAppcenterServicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserGroupAppcenterServicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGroupAppcenterServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGroupAppcenterFlowsComponent } from './user-group-appcenter-flows.component';

describe('UserGroupAppcenterFlowsComponent', () => {
  let component: UserGroupAppcenterFlowsComponent;
  let fixture: ComponentFixture<UserGroupAppcenterFlowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserGroupAppcenterFlowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGroupAppcenterFlowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

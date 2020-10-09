import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGroupAppcenterBokmarkComponent } from './user-group-appcenter-bokmark.component';

describe('UserGroupAppcenterBokmarkComponent', () => {
  let component: UserGroupAppcenterBokmarkComponent;
  let fixture: ComponentFixture<UserGroupAppcenterBokmarkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserGroupAppcenterBokmarkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGroupAppcenterBokmarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGroupAuthorComponent } from './user-group-author.component';

describe('UserGroupAuthorComponent', () => {
  let component: UserGroupAuthorComponent;
  let fixture: ComponentFixture<UserGroupAuthorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserGroupAuthorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGroupAuthorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

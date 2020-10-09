import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthModeComponent } from './auth-mode.component';

describe('AuthModeComponent', () => {
  let component: AuthModeComponent;
  let fixture: ComponentFixture<AuthModeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthModeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

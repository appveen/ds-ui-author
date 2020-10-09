import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxBtnComponent } from './checkbox-btn.component';

describe('CheckboxBtnComponent', () => {
  let component: CheckboxBtnComponent;
  let fixture: ComponentFixture<CheckboxBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckboxBtnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PickMonthComponent } from './pick-month.component';

describe('PickMonthComponent', () => {
  let component: PickMonthComponent;
  let fixture: ComponentFixture<PickMonthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PickMonthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PickMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

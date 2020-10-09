import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderMonthComponent } from './slider-month.component';

describe('SliderMonthComponent', () => {
  let component: SliderMonthComponent;
  let fixture: ComponentFixture<SliderMonthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SliderMonthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

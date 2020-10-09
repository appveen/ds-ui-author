import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderWeekComponent } from './slider-week.component';

describe('SliderWeekComponent', () => {
  let component: SliderWeekComponent;
  let fixture: ComponentFixture<SliderWeekComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SliderWeekComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

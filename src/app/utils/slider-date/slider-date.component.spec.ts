import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderDateComponent } from './slider-date.component';

describe('SliderDateComponent', () => {
  let component: SliderDateComponent;
  let fixture: ComponentFixture<SliderDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SliderDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

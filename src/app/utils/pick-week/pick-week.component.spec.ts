import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PickWeekComponent } from './pick-week.component';

describe('PickWeekComponent', () => {
  let component: PickWeekComponent;
  let fixture: ComponentFixture<PickWeekComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PickWeekComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PickWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

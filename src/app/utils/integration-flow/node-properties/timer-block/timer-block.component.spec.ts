import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimerBlockComponent } from './timer-block.component';

describe('TimerBlockComponent', () => {
  let component: TimerBlockComponent;
  let fixture: ComponentFixture<TimerBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimerBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimerBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PickMinuteComponent } from './pick-minute.component';

describe('PickMinuteComponent', () => {
  let component: PickMinuteComponent;
  let fixture: ComponentFixture<PickMinuteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PickMinuteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PickMinuteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

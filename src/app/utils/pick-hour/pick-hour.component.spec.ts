import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PickHourComponent } from './pick-hour.component';

describe('PickHourComponent', () => {
  let component: PickHourComponent;
  let fixture: ComponentFixture<PickHourComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PickHourComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PickHourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

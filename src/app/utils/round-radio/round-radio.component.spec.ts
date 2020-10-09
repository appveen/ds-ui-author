import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundRadioComponent } from './round-radio.component';

describe('RoundRadioComponent', () => {
  let component: RoundRadioComponent;
  let fixture: ComponentFixture<RoundRadioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoundRadioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundRadioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

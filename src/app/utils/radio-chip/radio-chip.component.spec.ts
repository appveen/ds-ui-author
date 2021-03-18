import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioChipComponent } from './radio-chip.component';

describe('RadioChipComponent', () => {
  let component: RadioChipComponent;
  let fixture: ComponentFixture<RadioChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RadioChipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

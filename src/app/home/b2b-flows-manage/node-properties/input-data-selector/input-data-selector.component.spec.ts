import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputDataSelectorComponent } from './input-data-selector.component';

describe('InputDataSelectorComponent', () => {
  let component: InputDataSelectorComponent;
  let fixture: ComponentFixture<InputDataSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputDataSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputDataSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

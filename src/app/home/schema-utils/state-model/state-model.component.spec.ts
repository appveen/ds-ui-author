import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateModelComponent } from './state-model.component';

describe('StateModelComponent', () => {
  let component: StateModelComponent;
  let fixture: ComponentFixture<StateModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StateModelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StateModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

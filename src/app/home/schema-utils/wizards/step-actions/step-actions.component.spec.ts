import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepActionsComponent } from './step-actions.component';

describe('StepActionsComponent', () => {
  let component: StepActionsComponent;
  let fixture: ComponentFixture<StepActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StepActionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

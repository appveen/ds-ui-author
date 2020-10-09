import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaBuilderComponent } from './formula-builder.component';

describe('FormulaBuilderComponent', () => {
  let component: FormulaBuilderComponent;
  let fixture: ComponentFixture<FormulaBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormulaBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulaBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

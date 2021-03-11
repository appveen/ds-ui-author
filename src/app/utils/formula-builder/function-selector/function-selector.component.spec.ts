import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionSelectorComponent } from './function-selector.component';

describe('FunctionSelectorComponent', () => {
  let component: FunctionSelectorComponent;
  let fixture: ComponentFixture<FunctionSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FunctionSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

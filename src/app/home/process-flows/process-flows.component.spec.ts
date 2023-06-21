import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessFlowsComponent } from './process-flows.component';

describe('ProcessFlowsComponent', () => {
  let component: ProcessFlowsComponent;
  let fixture: ComponentFixture<ProcessFlowsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessFlowsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessFlowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

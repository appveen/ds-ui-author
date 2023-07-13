import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessFlowNodeComponent } from './process-node.component';

describe('ProcessFlowNodeComponent', () => {
  let component: ProcessFlowNodeComponent;
  let fixture: ComponentFixture<ProcessFlowNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessFlowNodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessFlowNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

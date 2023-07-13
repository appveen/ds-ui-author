import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessFlowManageComponent } from './process-flow-manage.component';

describe('ProcessFlowManageComponent', () => {
  let component: ProcessFlowManageComponent;
  let fixture: ComponentFixture<ProcessFlowManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessFlowManageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessFlowManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowNodeComponent } from './flow-node.component';

describe('FlowNodeComponent', () => {
  let component: FlowNodeComponent;
  let fixture: ComponentFixture<FlowNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlowNodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

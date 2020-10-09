import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrationFlowComponent } from './integration-flow.component';

describe('IntegrationFlowComponent', () => {
  let component: IntegrationFlowComponent;
  let fixture: ComponentFixture<IntegrationFlowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationFlowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

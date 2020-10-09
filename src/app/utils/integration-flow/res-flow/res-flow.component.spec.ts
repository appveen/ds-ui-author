import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResFlowComponent } from './res-flow.component';

describe('ResFlowComponent', () => {
  let component: ResFlowComponent;
  let fixture: ComponentFixture<ResFlowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResFlowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

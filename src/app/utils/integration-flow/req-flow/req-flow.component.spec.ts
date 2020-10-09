import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReqFlowComponent } from './req-flow.component';

describe('ReqFlowComponent', () => {
  let component: ReqFlowComponent;
  let fixture: ComponentFixture<ReqFlowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReqFlowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReqFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowLineComponent } from './flow-line.component';

describe('FlowLineComponent', () => {
  let component: FlowLineComponent;
  let fixture: ComponentFixture<FlowLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlowLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

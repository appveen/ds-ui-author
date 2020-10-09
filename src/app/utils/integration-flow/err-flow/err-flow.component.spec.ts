import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrFlowComponent } from './err-flow.component';

describe('ErrFlowComponent', () => {
  let component: ErrFlowComponent;
  let fixture: ComponentFixture<ErrFlowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrFlowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

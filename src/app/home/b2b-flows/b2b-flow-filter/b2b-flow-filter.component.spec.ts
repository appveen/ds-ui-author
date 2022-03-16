import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2bFlowFilterComponent } from './b2b-flow-filter.component';

describe('B2bFlowFilterComponent', () => {
  let component: B2bFlowFilterComponent;
  let fixture: ComponentFixture<B2bFlowFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ B2bFlowFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(B2bFlowFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

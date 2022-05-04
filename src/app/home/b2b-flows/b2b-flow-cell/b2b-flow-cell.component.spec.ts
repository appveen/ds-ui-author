import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2bFlowCellComponent } from './b2b-flow-cell.component';

describe('B2bFlowCellComponent', () => {
  let component: B2bFlowCellComponent;
  let fixture: ComponentFixture<B2bFlowCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ B2bFlowCellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(B2bFlowCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

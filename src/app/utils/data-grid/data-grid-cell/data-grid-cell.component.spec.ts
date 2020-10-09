import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataGridCellComponent } from './data-grid-cell.component';

describe('DataGridCellComponent', () => {
  let component: DataGridCellComponent;
  let fixture: ComponentFixture<DataGridCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataGridCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataGridCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

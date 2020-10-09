import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogsGridCellComponent } from './logs-grid-cell.component';

describe('LogsGridCellComponent', () => {
  let component: LogsGridCellComponent;
  let fixture: ComponentFixture<LogsGridCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogsGridCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogsGridCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

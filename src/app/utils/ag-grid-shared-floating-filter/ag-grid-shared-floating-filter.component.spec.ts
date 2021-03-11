import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgGridSharedFloatingFilterComponent } from './ag-grid-shared-floating-filter.component';

describe('AgGridSharedFloatingFilterComponent', () => {
  let component: AgGridSharedFloatingFilterComponent;
  let fixture: ComponentFixture<AgGridSharedFloatingFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgGridSharedFloatingFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgGridSharedFloatingFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

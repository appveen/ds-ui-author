import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgGridActionsRendererComponent } from './ag-grid-actions-renderer.component';

describe('AgGridActionsRendererComponent', () => {
  let component: AgGridActionsRendererComponent;
  let fixture: ComponentFixture<AgGridActionsRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgGridActionsRendererComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgGridActionsRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

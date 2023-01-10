import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkImportStatusComponent } from './bulk-import-status.component';

describe('BulkImportStatusComponent', () => {
  let component: BulkImportStatusComponent;
  let fixture: ComponentFixture<BulkImportStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkImportStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkImportStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

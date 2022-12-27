import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataIngestionComponent } from './data-ingestion.component';

describe('DataIngestionComponent', () => {
  let component: DataIngestionComponent;
  let fixture: ComponentFixture<DataIngestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataIngestionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataIngestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

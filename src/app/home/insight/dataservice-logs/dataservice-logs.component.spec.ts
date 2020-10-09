import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataserviceLogsComponent } from './dataservice-logs.component';

describe('DataserviceLogsComponent', () => {
  let component: DataserviceLogsComponent;
  let fixture: ComponentFixture<DataserviceLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataserviceLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataserviceLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

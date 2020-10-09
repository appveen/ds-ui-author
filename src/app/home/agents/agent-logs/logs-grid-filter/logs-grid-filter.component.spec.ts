import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogsGridFilterComponent } from './logs-grid-filter.component';

describe('LogsGridFilterComponent', () => {
  let component: LogsGridFilterComponent;
  let fixture: ComponentFixture<LogsGridFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogsGridFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogsGridFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

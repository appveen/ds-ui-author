import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataGridHeaderComponent } from './data-grid-header.component';

describe('DataGridHeaderComponent', () => {
  let component: DataGridHeaderComponent;
  let fixture: ComponentFixture<DataGridHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataGridHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataGridHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

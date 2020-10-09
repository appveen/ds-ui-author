import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataFormatManageComponent } from './data-format-manage.component';

describe('DataFormatManageComponent', () => {
  let component: DataFormatManageComponent;
  let fixture: ComponentFixture<DataFormatManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataFormatManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataFormatManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

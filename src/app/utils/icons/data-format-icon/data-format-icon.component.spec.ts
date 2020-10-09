import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataFormatIconComponent } from './data-format-icon.component';

describe('DataFormatIconComponent', () => {
  let component: DataFormatIconComponent;
  let fixture: ComponentFixture<DataFormatIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataFormatIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataFormatIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataObjectComponent } from './data-object.component';

describe('DataObjectComponent', () => {
  let component: DataObjectComponent;
  let fixture: ComponentFixture<DataObjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataObjectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

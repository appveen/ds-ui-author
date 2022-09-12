import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataServiceIconComponent } from './data-service-icon.component';

describe('DataServiceIconComponent', () => {
  let component: DataServiceIconComponent;
  let fixture: ComponentFixture<DataServiceIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataServiceIconComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataServiceIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataServicePropertiesComponent } from './data-service-properties.component';

describe('DataServicePropertiesComponent', () => {
  let component: DataServicePropertiesComponent;
  let fixture: ComponentFixture<DataServicePropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataServicePropertiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataServicePropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

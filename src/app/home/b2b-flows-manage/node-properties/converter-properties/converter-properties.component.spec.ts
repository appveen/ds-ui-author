import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConverterPropertiesComponent } from './converter-properties.component';

describe('ConverterPropertiesComponent', () => {
  let component: ConverterPropertiesComponent;
  let fixture: ComponentFixture<ConverterPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConverterPropertiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConverterPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

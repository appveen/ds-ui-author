import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureFieldPropertiesComponent } from './structure-field-properties.component';

describe('StructureFieldPropertiesComponent', () => {
  let component: StructureFieldPropertiesComponent;
  let fixture: ComponentFixture<StructureFieldPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StructureFieldPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructureFieldPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

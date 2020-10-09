import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerPropertiesComponent } from './partner-properties.component';

describe('PartnerPropertiesComponent', () => {
  let component: PartnerPropertiesComponent;
  let fixture: ComponentFixture<PartnerPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnerPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerConfigurationComponent } from './partner-configuration.component';

describe('PartnerConfigurationComponent', () => {
  let component: PartnerConfigurationComponent;
  let fixture: ComponentFixture<PartnerConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnerConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

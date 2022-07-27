import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceImportWizardComponent } from './service-import-wizard.component';

describe('ServiceImportWizardComponent', () => {
  let component: ServiceImportWizardComponent;
  let fixture: ComponentFixture<ServiceImportWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceImportWizardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceImportWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

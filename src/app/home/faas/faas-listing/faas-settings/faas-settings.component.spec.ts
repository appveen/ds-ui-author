import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaasSettingsComponent } from './faas-settings.component';

describe('FaasSettingsComponent', () => {
  let component: FaasSettingsComponent;
  let fixture: ComponentFixture<FaasSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaasSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaasSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

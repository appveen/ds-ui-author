import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceSelectorComponent } from './service-selector.component';

describe('ServiceSelectorComponent', () => {
  let component: ServiceSelectorComponent;
  let fixture: ComponentFixture<ServiceSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

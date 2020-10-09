import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerManagementComponent } from './partner-management.component';

describe('PartnerManagementComponent', () => {
  let component: PartnerManagementComponent;
  let fixture: ComponentFixture<PartnerManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnerManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerOnboardComponent } from './partner-onboard.component';

describe('PartnerOnboardComponent', () => {
  let component: PartnerOnboardComponent;
  let fixture: ComponentFixture<PartnerOnboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnerOnboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerOnboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

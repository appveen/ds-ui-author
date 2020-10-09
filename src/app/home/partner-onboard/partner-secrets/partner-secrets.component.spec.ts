import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerSecretsComponent } from './partner-secrets.component';

describe('PartnerSecretsComponent', () => {
  let component: PartnerSecretsComponent;
  let fixture: ComponentFixture<PartnerSecretsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnerSecretsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerSecretsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

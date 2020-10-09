import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerMicroflowsComponent } from './partner-microflows.component';

describe('PartnerMicroflowsComponent', () => {
  let component: PartnerMicroflowsComponent;
  let fixture: ComponentFixture<PartnerMicroflowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnerMicroflowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerMicroflowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

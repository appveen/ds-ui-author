import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerListingComponent } from './partner-listing.component';

describe('PartnerListingComponent', () => {
  let component: PartnerListingComponent;
  let fixture: ComponentFixture<PartnerListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnerListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

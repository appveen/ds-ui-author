import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NanoServiceListingComponent } from './nano-service-listing.component';

describe('NanoserviceListingComponent', () => {
  let component: NanoServiceListingComponent;
  let fixture: ComponentFixture<NanoServiceListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NanoServiceListingComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NanoServiceListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

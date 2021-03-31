import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaasListingComponent } from './faas-listing.component';

describe('FaasListingComponent', () => {
  let component: FaasListingComponent;
  let fixture: ComponentFixture<FaasListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaasListingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaasListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

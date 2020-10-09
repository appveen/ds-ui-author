import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataFormatListingComponent } from './data-format-listing.component';

describe('DataFormatListingComponent', () => {
  let component: DataFormatListingComponent;
  let fixture: ComponentFixture<DataFormatListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataFormatListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataFormatListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

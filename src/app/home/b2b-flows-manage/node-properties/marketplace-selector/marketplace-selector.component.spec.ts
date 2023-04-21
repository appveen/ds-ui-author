import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceSelectorComponent } from './marketplace-selector.component';

describe('MarketplaceSelectorComponent', () => {
  let component: MarketplaceSelectorComponent;
  let fixture: ComponentFixture<MarketplaceSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarketplaceSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketplaceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomFormatSelectorComponent } from './custom-format-selector.component';

describe('CustomFormatSelectorComponent', () => {
  let component: CustomFormatSelectorComponent;
  let fixture: ComponentFixture<CustomFormatSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomFormatSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomFormatSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

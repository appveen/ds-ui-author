import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataFormatSelectorComponent } from './data-format-selector.component';

describe('DataFormatSelectorComponent', () => {
  let component: DataFormatSelectorComponent;
  let fixture: ComponentFixture<DataFormatSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataFormatSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataFormatSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

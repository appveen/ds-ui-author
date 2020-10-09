import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormatSelectorComponent } from './format-selector.component';

describe('FormatSelectorComponent', () => {
  let component: FormatSelectorComponent;
  let fixture: ComponentFixture<FormatSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormatSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormatSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

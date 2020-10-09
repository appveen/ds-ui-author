import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldTypeSelectorComponent } from './field-type-selector.component';

describe('FieldTypeSelectorComponent', () => {
  let component: FieldTypeSelectorComponent;
  let fixture: ComponentFixture<FieldTypeSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldTypeSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldTypeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldsSelectorComponent } from './fields-selector.component';

describe('FieldsSelectorComponent', () => {
  let component: FieldsSelectorComponent;
  let fixture: ComponentFixture<FieldsSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldsSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldsSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

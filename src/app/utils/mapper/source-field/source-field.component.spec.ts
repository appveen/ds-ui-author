import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceFieldComponent } from './source-field.component';

describe('SourceFieldComponent', () => {
  let component: SourceFieldComponent;
  let fixture: ComponentFixture<SourceFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SourceFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomFormatIconComponent } from './custom-format-icon.component';

describe('CustomFormatIconComponent', () => {
  let component: CustomFormatIconComponent;
  let fixture: ComponentFixture<CustomFormatIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomFormatIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomFormatIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

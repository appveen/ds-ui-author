import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatePropertyComponent } from './date-property.component';

describe('DatePropertyComponent', () => {
  let component: DatePropertyComponent;
  let fixture: ComponentFixture<DatePropertyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatePropertyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatePropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

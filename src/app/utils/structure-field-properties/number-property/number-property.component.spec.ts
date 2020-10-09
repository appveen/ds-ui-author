import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberPropertyComponent } from './number-property.component';

describe('NumberPropertyComponent', () => {
  let component: NumberPropertyComponent;
  let fixture: ComponentFixture<NumberPropertyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NumberPropertyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

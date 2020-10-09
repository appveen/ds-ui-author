import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PickDateComponent } from './pick-date.component';

describe('PickDateComponent', () => {
  let component: PickDateComponent;
  let fixture: ComponentFixture<PickDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PickDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PickDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

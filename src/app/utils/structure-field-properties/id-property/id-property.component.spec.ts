import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdPropertyComponent } from './id-property.component';

describe('IdPropertyComponent', () => {
  let component: IdPropertyComponent;
  let fixture: ComponentFixture<IdPropertyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdPropertyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

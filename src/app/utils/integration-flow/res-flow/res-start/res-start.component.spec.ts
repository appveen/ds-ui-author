import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResStartComponent } from './res-start.component';

describe('ResStartComponent', () => {
  let component: ResStartComponent;
  let fixture: ComponentFixture<ResStartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResStartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

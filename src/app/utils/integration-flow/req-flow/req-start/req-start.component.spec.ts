import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReqStartComponent } from './req-start.component';

describe('ReqStartComponent', () => {
  let component: ReqStartComponent;
  let fixture: ComponentFixture<ReqStartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReqStartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReqStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

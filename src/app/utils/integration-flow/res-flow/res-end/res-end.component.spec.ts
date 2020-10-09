import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResEndComponent } from './res-end.component';

describe('ResEndComponent', () => {
  let component: ResEndComponent;
  let fixture: ComponentFixture<ResEndComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResEndComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResEndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

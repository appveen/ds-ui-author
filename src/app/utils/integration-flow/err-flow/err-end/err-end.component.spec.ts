import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrEndComponent } from './err-end.component';

describe('ErrEndComponent', () => {
  let component: ErrEndComponent;
  let fixture: ComponentFixture<ErrEndComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrEndComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrEndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

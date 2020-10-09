import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrStartComponent } from './err-start.component';

describe('ErrStartComponent', () => {
  let component: ErrStartComponent;
  let fixture: ComponentFixture<ErrStartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrStartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

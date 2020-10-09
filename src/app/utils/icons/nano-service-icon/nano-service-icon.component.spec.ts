import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NanoServiceIconComponent } from './nano-service-icon.component';

describe('NanoServiceIconComponent', () => {
  let component: NanoServiceIconComponent;
  let fixture: ComponentFixture<NanoServiceIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NanoServiceIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NanoServiceIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

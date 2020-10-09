import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FingerprintIconComponent } from './fingerprint-icon.component';

describe('FingerprintIconComponent', () => {
  let component: FingerprintIconComponent;
  let fixture: ComponentFixture<FingerprintIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FingerprintIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FingerprintIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoapBlockComponent } from './soap-block.component';

describe('SoapBlockComponent', () => {
  let component: SoapBlockComponent;
  let fixture: ComponentFixture<SoapBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoapBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoapBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

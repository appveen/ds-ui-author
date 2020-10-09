import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MicroflowComponent } from './microflow.component';

describe('MicroflowComponent', () => {
  let component: MicroflowComponent;
  let fixture: ComponentFixture<MicroflowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MicroflowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MicroflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

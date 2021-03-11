import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamSelectorComponent } from './param-selector.component';

describe('ParamSelectorComponent', () => {
  let component: ParamSelectorComponent;
  let fixture: ComponentFixture<ParamSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParamSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParamSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

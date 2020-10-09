import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogicalConditionComponent } from './logical-condition.component';

describe('LogicalConditionComponent', () => {
  let component: LogicalConditionComponent;
  let fixture: ComponentFixture<LogicalConditionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogicalConditionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogicalConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

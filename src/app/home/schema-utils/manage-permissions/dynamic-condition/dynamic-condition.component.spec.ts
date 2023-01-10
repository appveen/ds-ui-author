import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicConditionComponent } from './dynamic-condition.component';

describe('DynamicConditionComponent', () => {
  let component: DynamicConditionComponent;
  let fixture: ComponentFixture<DynamicConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicConditionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

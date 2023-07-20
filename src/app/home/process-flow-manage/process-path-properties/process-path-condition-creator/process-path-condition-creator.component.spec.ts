import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessPathConditionCreatorComponent } from './process-path-condition-creator.component';

describe('PathConditionCreatorComponent', () => {
  let component: ProcessPathConditionCreatorComponent;
  let fixture: ComponentFixture<ProcessPathConditionCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessPathConditionCreatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessPathConditionCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

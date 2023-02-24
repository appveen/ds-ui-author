import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathConditionCreatorComponent } from './path-condition-creator.component';

describe('PathConditionCreatorComponent', () => {
  let component: PathConditionCreatorComponent;
  let fixture: ComponentFixture<PathConditionCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PathConditionCreatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PathConditionCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

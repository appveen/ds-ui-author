import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentsStreakComponent } from './agents-streak.component';

describe('AgentsStreakComponent', () => {
  let component: AgentsStreakComponent;
  let fixture: ComponentFixture<AgentsStreakComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentsStreakComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentsStreakComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

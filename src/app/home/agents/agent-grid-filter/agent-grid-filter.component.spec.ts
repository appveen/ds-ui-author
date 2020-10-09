import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentGridFilterComponent } from './agent-grid-filter.component';

describe('AgentGridFilterComponent', () => {
  let component: AgentGridFilterComponent;
  let fixture: ComponentFixture<AgentGridFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentGridFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentGridFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

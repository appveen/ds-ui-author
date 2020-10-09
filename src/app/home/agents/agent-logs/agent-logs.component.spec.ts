import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentLogsComponent } from './agent-logs.component';

describe('AgentLogsComponent', () => {
  let component: AgentLogsComponent;
  let fixture: ComponentFixture<AgentLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

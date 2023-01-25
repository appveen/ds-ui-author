import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentLogsComponent } from './agent-logs.component';

describe('AgentLogsComponent', () => {
  let component: AgentLogsComponent;
  let fixture: ComponentFixture<AgentLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgentLogsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

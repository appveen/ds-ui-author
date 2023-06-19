import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentSessionsComponent } from './agent-sessions.component';

describe('AgentSessionsComponent', () => {
  let component: AgentSessionsComponent;
  let fixture: ComponentFixture<AgentSessionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgentSessionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

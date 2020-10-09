import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentBlockComponent } from './agent-block.component';

describe('AgentBlockComponent', () => {
  let component: AgentBlockComponent;
  let fixture: ComponentFixture<AgentBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

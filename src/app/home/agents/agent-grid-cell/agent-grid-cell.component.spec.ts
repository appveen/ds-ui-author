import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentGridCellComponent } from './agent-grid-cell.component';

describe('AgentGridCellComponent', () => {
  let component: AgentGridCellComponent;
  let fixture: ComponentFixture<AgentGridCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentGridCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentGridCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

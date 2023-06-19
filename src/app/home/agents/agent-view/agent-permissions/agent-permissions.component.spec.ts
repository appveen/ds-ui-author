import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentPermissionsComponent } from './agent-permissions.component';

describe('AgentPermissionsComponent', () => {
  let component: AgentPermissionsComponent;
  let fixture: ComponentFixture<AgentPermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgentPermissionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

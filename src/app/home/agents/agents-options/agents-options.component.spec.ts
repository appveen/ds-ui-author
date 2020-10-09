import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentsOptionsComponent } from './agents-options.component';

describe('AgentsOptionsComponent', () => {
  let component: AgentsOptionsComponent;
  let fixture: ComponentFixture<AgentsOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentsOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentsOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

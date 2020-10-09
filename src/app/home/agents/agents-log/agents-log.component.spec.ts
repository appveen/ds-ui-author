import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentsLogComponent } from './agents-log.component';

describe('AgentsLogComponent', () => {
  let component: AgentsLogComponent;
  let fixture: ComponentFixture<AgentsLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentsLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentsLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

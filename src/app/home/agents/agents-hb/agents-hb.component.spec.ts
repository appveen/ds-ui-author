import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentsHbComponent } from './agents-hb.component';

describe('AgentsHbComponent', () => {
  let component: AgentsHbComponent;
  let fixture: ComponentFixture<AgentsHbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentsHbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentsHbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

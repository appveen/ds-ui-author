import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAuthorAgentsComponent } from './group-author-agents.component';

describe('GroupAuthorAgentsComponent', () => {
  let component: GroupAuthorAgentsComponent;
  let fixture: ComponentFixture<GroupAuthorAgentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAuthorAgentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAuthorAgentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

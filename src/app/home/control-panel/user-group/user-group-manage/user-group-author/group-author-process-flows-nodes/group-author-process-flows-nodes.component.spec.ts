import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAuthorProcessFlowsNodesComponent } from './group-author-process-flows-nodes.component';

describe('GroupAuthorProcessFlowsNodesComponent', () => {
  let component: GroupAuthorProcessFlowsNodesComponent;
  let fixture: ComponentFixture<GroupAuthorProcessFlowsNodesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GroupAuthorProcessFlowsNodesComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAuthorProcessFlowsNodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

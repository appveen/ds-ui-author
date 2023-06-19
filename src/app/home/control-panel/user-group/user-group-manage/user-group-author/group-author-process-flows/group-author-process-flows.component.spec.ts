import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAuthorProcessFlowsComponent } from './group-author-process-flows.component';

describe('GroupAuthorProcessFlowsComponent', () => {
  let component: GroupAuthorProcessFlowsComponent;
  let fixture: ComponentFixture<GroupAuthorProcessFlowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GroupAuthorProcessFlowsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAuthorProcessFlowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

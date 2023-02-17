import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAuthorFlowsComponent } from './group-author-flows.component';

describe('GroupAuthorFlowsComponent', () => {
  let component: GroupAuthorFlowsComponent;
  let fixture: ComponentFixture<GroupAuthorFlowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GroupAuthorFlowsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAuthorFlowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

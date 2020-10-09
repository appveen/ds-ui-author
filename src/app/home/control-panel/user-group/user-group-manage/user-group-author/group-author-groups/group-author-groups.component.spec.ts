import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAuthorGroupsComponent } from './group-author-groups.component';

describe('GroupAuthorGroupsComponent', () => {
  let component: GroupAuthorGroupsComponent;
  let fixture: ComponentFixture<GroupAuthorGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAuthorGroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAuthorGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

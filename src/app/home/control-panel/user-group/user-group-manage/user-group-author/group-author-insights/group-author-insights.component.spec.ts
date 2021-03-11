import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAuthorInsightsComponent } from './group-author-insights.component';

describe('GroupAuthorInsightsComponent', () => {
  let component: GroupAuthorInsightsComponent;
  let fixture: ComponentFixture<GroupAuthorInsightsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAuthorInsightsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAuthorInsightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

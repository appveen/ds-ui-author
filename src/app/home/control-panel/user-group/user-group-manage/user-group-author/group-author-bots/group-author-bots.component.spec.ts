import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAuthorBotsComponent } from './group-author-bots.component';

describe('GroupAuthorBotsComponent', () => {
  let component: GroupAuthorBotsComponent;
  let fixture: ComponentFixture<GroupAuthorBotsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAuthorBotsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAuthorBotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

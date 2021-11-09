import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAuthorFunctionsComponent } from './group-author-functions.component';

describe('GroupAuthorFunctionsComponent', () => {
  let component: GroupAuthorFunctionsComponent;
  let fixture: ComponentFixture<GroupAuthorFunctionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAuthorFunctionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAuthorFunctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAuthorLibraryComponent } from './group-author-library.component';

describe('GroupAuthorLibraryComponent', () => {
  let component: GroupAuthorLibraryComponent;
  let fixture: ComponentFixture<GroupAuthorLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAuthorLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAuthorLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

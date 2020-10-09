import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAuthorDataFormatsComponent } from './group-author-data-formats.component';

describe('GroupAuthorDataFormatsComponent', () => {
  let component: GroupAuthorDataFormatsComponent;
  let fixture: ComponentFixture<GroupAuthorDataFormatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAuthorDataFormatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAuthorDataFormatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

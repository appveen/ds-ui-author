import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAuthorDataServicesComponent } from './group-author-data-services.component';

describe('GroupAuthorDataServicesComponent', () => {
  let component: GroupAuthorDataServicesComponent;
  let fixture: ComponentFixture<GroupAuthorDataServicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAuthorDataServicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAuthorDataServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

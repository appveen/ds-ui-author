import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAuthorNanoServicesComponent } from './group-author-nano-services.component';

describe('GroupAuthorNanoServicesComponent', () => {
  let component: GroupAuthorNanoServicesComponent;
  let fixture: ComponentFixture<GroupAuthorNanoServicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAuthorNanoServicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAuthorNanoServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

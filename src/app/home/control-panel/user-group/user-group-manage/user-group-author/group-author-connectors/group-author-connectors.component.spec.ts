import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAuthorConnectorsComponent } from './group-author-connectors.component';

describe('GroupAuthorConnectorsComponent', () => {
  let component: GroupAuthorConnectorsComponent;
  let fixture: ComponentFixture<GroupAuthorConnectorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupAuthorConnectorsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupAuthorConnectorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListCellRendererComponent } from './user-list-cell-renderer.component';

describe('UserListCellRendererComponent', () => {
  let component: UserListCellRendererComponent;
  let fixture: ComponentFixture<UserListCellRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserListCellRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

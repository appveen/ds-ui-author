import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupLogsComponent } from './group-logs.component';

describe('GroupLogsComponent', () => {
  let component: GroupLogsComponent;
  let fixture: ComponentFixture<GroupLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

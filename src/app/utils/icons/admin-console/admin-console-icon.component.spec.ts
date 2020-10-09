import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminConsoleIconComponent } from 'src/app/utils/icons/admin-console/admin-console-icon.component';

describe('AdminConsoleIconComponent', () => {
  let component: AdminConsoleIconComponent;
  let fixture: ComponentFixture<AdminConsoleIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminConsoleIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminConsoleIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

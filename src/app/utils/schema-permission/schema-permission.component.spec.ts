import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaPermissionComponent } from './schema-permission.component';

describe('SchemaPermissionComponent', () => {
  let component: SchemaPermissionComponent;
  let fixture: ComponentFixture<SchemaPermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SchemaPermissionComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SchemaPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

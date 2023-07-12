import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileRwPropertiesComponent } from './file-rw-properties.component';

describe('FileRwPropertiesComponent', () => {
  let component: FileRwPropertiesComponent;
  let fixture: ComponentFixture<FileRwPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileRwPropertiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileRwPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

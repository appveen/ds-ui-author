import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessPathPropertiesComponent } from './process-path-properties.component';

describe('ProcessPathPropertiesComponent', () => {
  let component: ProcessPathPropertiesComponent;
  let fixture: ComponentFixture<ProcessPathPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessPathPropertiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessPathPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

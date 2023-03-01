import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTransformComponent } from './data-transform.component';

describe('DataTransformComponent', () => {
  let component: DataTransformComponent;
  let fixture: ComponentFixture<DataTransformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataTransformComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTransformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

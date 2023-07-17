import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathPropertiesComponent } from './path-properties.component';

describe('PathPropertiesComponent', () => {
  let component: PathPropertiesComponent;
  let fixture: ComponentFixture<PathPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PathPropertiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PathPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

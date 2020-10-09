import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppCenterPreviewComponent } from './app-center-preview.component';

describe('AppCenterPreviewComponent', () => {
  let component: AppCenterPreviewComponent;
  let fixture: ComponentFixture<AppCenterPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppCenterPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppCenterPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

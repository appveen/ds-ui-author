import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetServiceComponent } from './reset-service.component';

describe('ResetServiceComponent', () => {
  let component: ResetServiceComponent;
  let fixture: ComponentFixture<ResetServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResetServiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

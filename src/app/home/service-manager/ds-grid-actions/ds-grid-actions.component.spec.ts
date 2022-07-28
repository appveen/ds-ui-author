import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DsGridActionsComponent } from './ds-grid-actions.component';

describe('DsGridActionsComponent', () => {
  let component: DsGridActionsComponent;
  let fixture: ComponentFixture<DsGridActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DsGridActionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DsGridActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

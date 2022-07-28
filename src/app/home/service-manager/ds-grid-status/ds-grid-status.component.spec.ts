import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DsGridStatusComponent } from './ds-grid-status.component';

describe('DsGridStatusComponent', () => {
  let component: DsGridStatusComponent;
  let fixture: ComponentFixture<DsGridStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DsGridStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DsGridStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

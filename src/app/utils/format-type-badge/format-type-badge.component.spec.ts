import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormatTypeBadgeComponent } from './format-type-badge.component';

describe('FormatTypeBadgeComponent', () => {
  let component: FormatTypeBadgeComponent;
  let fixture: ComponentFixture<FormatTypeBadgeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormatTypeBadgeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormatTypeBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

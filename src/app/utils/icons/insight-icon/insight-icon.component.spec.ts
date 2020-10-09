import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsightIconComponent } from './insight-icon.component';

describe('InsightIconComponent', () => {
  let component: InsightIconComponent;
  let fixture: ComponentFixture<InsightIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsightIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsightIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

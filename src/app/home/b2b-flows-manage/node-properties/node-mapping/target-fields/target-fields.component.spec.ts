import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetFieldsComponent } from './target-fields.component';

describe('TargetFieldsComponent', () => {
  let component: TargetFieldsComponent;
  let fixture: ComponentFixture<TargetFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TargetFieldsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TargetFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

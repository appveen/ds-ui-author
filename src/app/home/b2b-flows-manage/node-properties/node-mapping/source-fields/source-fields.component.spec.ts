import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceFieldsComponent } from './source-fields.component';

describe('SourceFieldsComponent', () => {
  let component: SourceFieldsComponent;
  let fixture: ComponentFixture<SourceFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SourceFieldsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SourceFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

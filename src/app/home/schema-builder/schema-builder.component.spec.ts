import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaBuilderComponent } from './schema-builder.component';

describe('SchemaBuilderComponent', () => {
  let component: SchemaBuilderComponent;
  let fixture: ComponentFixture<SchemaBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SchemaBuilderComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

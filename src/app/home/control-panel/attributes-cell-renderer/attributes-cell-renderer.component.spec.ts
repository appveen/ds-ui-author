import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributesCellRendererComponent } from './attributes-cell-renderer.component';

describe('AttributesCellRendererComponent', () => {
  let component: AttributesCellRendererComponent;
  let fixture: ComponentFixture<AttributesCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttributesCellRendererComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributesCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

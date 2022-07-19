import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonotypeEditorComponent } from './monotype-editor.component';

describe('MonotypeEditorComponent', () => {
  let component: MonotypeEditorComponent;
  let fixture: ComponentFixture<MonotypeEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonotypeEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonotypeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectFormatBlockComponent } from './select-format-block.component';

describe('SelectFormatBlockComponent', () => {
  let component: SelectFormatBlockComponent;
  let fixture: ComponentFixture<SelectFormatBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectFormatBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectFormatBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

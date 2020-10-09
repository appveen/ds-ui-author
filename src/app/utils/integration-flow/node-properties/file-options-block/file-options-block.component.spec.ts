import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileOptionsBlockComponent } from './file-options-block.component';

describe('FileOptionsBlockComponent', () => {
  let component: FileOptionsBlockComponent;
  let fixture: ComponentFixture<FileOptionsBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileOptionsBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileOptionsBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileBlockComponent } from './file-block.component';

describe('FileBlockComponent', () => {
  let component: FileBlockComponent;
  let fixture: ComponentFixture<FileBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

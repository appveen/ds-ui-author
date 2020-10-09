import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryIconComponent } from './library-icon.component';

describe('LibraryIconComponent', () => {
  let component: LibraryIconComponent;
  let fixture: ComponentFixture<LibraryIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

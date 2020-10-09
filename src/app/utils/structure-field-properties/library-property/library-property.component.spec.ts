import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryPropertyComponent } from './library-property.component';

describe('LibraryPropertyComponent', () => {
  let component: LibraryPropertyComponent;
  let fixture: ComponentFixture<LibraryPropertyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryPropertyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyIconComponent } from './key-icon.component';

describe('KeyIconComponent', () => {
  let component: KeyIconComponent;
  let fixture: ComponentFixture<KeyIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeyIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

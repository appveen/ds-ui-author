import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NpmLibrariesComponent } from './npm-libraries.component';

describe('NpmLibrariesComponent', () => {
  let component: NpmLibrariesComponent;
  let fixture: ComponentFixture<NpmLibrariesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NpmLibrariesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NpmLibrariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

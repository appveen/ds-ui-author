import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHeadersComponent } from './add-headers.component';

describe('AddHeadersComponent', () => {
  let component: AddHeadersComponent;
  let fixture: ComponentFixture<AddHeadersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddHeadersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddHeadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomHeadersBlockComponent } from './custom-headers-block.component';

describe('CustomHeadersBlockComponent', () => {
  let component: CustomHeadersBlockComponent;
  let fixture: ComponentFixture<CustomHeadersBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomHeadersBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomHeadersBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

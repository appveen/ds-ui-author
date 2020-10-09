import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestBlockComponent } from './rest-block.component';

describe('RestBlockComponent', () => {
  let component: RestBlockComponent;
  let fixture: ComponentFixture<RestBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

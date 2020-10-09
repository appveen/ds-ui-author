import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityBlockComponent } from './security-block.component';

describe('SecurityBlockComponent', () => {
  let component: SecurityBlockComponent;
  let fixture: ComponentFixture<SecurityBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecurityBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecurityBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

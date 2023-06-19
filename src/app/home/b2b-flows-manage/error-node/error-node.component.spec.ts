import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorNodeComponent } from './error-node.component';

describe('ErrorNodeComponent', () => {
  let component: ErrorNodeComponent;
  let fixture: ComponentFixture<ErrorNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErrorNodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

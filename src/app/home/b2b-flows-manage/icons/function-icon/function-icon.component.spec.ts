import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionIconComponent } from './function-icon.component';

describe('FunctionIconComponent', () => {
  let component: FunctionIconComponent;
  let fixture: ComponentFixture<FunctionIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FunctionIconComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FunctionIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

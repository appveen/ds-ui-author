import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeOnEditComponent } from './change-on-edit.component';

describe('ChangeOnEditComponent', () => {
  let component: ChangeOnEditComponent;
  let fixture: ComponentFixture<ChangeOnEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeOnEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeOnEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

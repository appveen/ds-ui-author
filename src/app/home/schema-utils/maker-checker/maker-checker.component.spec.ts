import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakerCheckerComponent } from './maker-checker.component';

describe('MakerCheckerComponent', () => {
  let component: MakerCheckerComponent;
  let fixture: ComponentFixture<MakerCheckerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MakerCheckerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MakerCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2bSettingsComponent } from './b2b-settings.component';

describe('B2bSettingsComponent', () => {
  let component: B2bSettingsComponent;
  let fixture: ComponentFixture<B2bSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ B2bSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(B2bSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

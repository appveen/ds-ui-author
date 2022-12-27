import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvokeApiIconComponent } from './invoke-api-icon.component';

describe('InvokeApiIconComponent', () => {
  let component: InvokeApiIconComponent;
  let fixture: ComponentFixture<InvokeApiIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvokeApiIconComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvokeApiIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaasFilterComponent } from './faas-filter.component';

describe('FaasFilterComponent', () => {
  let component: FaasFilterComponent;
  let fixture: ComponentFixture<FaasFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaasFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaasFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

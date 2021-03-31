import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaasManageComponent } from './faas-manage.component';

describe('FaasManageComponent', () => {
  let component: FaasManageComponent;
  let fixture: ComponentFixture<FaasManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaasManageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaasManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

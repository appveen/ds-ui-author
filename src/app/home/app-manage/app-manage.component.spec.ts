import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppManageComponent } from './app-manage.component';

describe('AppManageComponent', () => {
  let component: AppManageComponent;
  let fixture: ComponentFixture<AppManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiKeysManageComponent } from './api-keys-manage.component';

describe('ApiKeysManageComponent', () => {
  let component: ApiKeysManageComponent;
  let fixture: ComponentFixture<ApiKeysManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApiKeysManageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApiKeysManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiKeysListComponent } from './api-keys-list.component';

describe('ApiKeysListComponent', () => {
  let component: ApiKeysListComponent;
  let fixture: ComponentFixture<ApiKeysListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApiKeysListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApiKeysListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

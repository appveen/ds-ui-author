import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AzureUsersComponent } from './azure-users.component';

describe('AzureUsersComponent', () => {
  let component: AzureUsersComponent;
  let fixture: ComponentFixture<AzureUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AzureUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AzureUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorsManageComponent } from './connectors-manage.component';

describe('ConnectorsManageComponent', () => {
  let component: ConnectorsManageComponent;
  let fixture: ComponentFixture<ConnectorsManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectorsManageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorsManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

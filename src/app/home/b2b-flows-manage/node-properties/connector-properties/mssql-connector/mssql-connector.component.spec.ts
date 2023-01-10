import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MssqlConnectorComponent } from './mssql-connector.component';

describe('MssqlConnectorComponent', () => {
  let component: MssqlConnectorComponent;
  let fixture: ComponentFixture<MssqlConnectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MssqlConnectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MssqlConnectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

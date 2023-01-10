import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SftpConnectorComponent } from './sftp-connector.component';

describe('SftpConnectorComponent', () => {
  let component: SftpConnectorComponent;
  let fixture: ComponentFixture<SftpConnectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SftpConnectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SftpConnectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

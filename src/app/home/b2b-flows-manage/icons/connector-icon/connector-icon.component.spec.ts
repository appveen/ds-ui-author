import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorIconComponent } from './connector-icon.component';

describe('ConnectorIconComponent', () => {
  let component: ConnectorIconComponent;
  let fixture: ComponentFixture<ConnectorIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectorIconComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

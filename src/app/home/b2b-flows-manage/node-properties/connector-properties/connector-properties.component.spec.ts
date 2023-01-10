import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorPropertiesComponent } from './connector-properties.component';

describe('ConnectorPropertiesComponent', () => {
  let component: ConnectorPropertiesComponent;
  let fixture: ComponentFixture<ConnectorPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectorPropertiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

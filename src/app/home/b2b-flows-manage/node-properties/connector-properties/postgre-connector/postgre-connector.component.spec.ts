import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostgreConnectorComponent } from './postgre-connector.component';

describe('PostgreConnectorComponent', () => {
  let component: PostgreConnectorComponent;
  let fixture: ComponentFixture<PostgreConnectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostgreConnectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostgreConnectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

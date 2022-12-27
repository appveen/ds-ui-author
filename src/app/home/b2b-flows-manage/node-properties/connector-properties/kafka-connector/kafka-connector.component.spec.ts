import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KafkaConnectorComponent } from './kafka-connector.component';

describe('KafkaConnectorComponent', () => {
  let component: KafkaConnectorComponent;
  let fixture: ComponentFixture<KafkaConnectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KafkaConnectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KafkaConnectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

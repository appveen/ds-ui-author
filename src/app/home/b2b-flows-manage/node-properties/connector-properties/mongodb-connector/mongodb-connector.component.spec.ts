import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MongodbConnectorComponent } from './mongodb-connector.component';

describe('MongodbConnectorComponent', () => {
  let component: MongodbConnectorComponent;
  let fixture: ComponentFixture<MongodbConnectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MongodbConnectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MongodbConnectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventNodeComponent } from './event-node.component';

describe('EventNodeComponent', () => {
  let component: EventNodeComponent;
  let fixture: ComponentFixture<EventNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventNodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowContantsComponent } from './flow-contants.component';

describe('FlowContantsComponent', () => {
  let component: FlowContantsComponent;
  let fixture: ComponentFixture<FlowContantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlowContantsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowContantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

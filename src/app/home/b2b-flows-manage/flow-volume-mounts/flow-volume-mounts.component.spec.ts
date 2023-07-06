import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowVolumeMountsComponent } from './flow-volume-mounts.component';

describe('FlowVolumeMountsComponent', () => {
  let component: FlowVolumeMountsComponent;
  let fixture: ComponentFixture<FlowVolumeMountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlowVolumeMountsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowVolumeMountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

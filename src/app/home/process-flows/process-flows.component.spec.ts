import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2bFlowsComponent } from './process-flows.component';

describe('B2bFlowsComponent', () => {
  let component: B2bFlowsComponent;
  let fixture: ComponentFixture<B2bFlowsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ B2bFlowsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(B2bFlowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

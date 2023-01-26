import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFlowComponent } from './list-flow.component';

describe('ListFlowComponent', () => {
  let component: ListFlowComponent;
  let fixture: ComponentFixture<ListFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListFlowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

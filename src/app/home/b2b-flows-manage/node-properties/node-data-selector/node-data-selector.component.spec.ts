import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeDataSelectorComponent } from './node-data-selector.component';

describe('NodeDataSelectorComponent', () => {
  let component: NodeDataSelectorComponent;
  let fixture: ComponentFixture<NodeDataSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NodeDataSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeDataSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

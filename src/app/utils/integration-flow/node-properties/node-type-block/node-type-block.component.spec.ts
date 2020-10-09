import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeTypeBlockComponent } from './node-type-block.component';

describe('NodeTypeBlockComponent', () => {
  let component: NodeTypeBlockComponent;
  let fixture: ComponentFixture<NodeTypeBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeTypeBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeTypeBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

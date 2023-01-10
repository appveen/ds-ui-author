import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeMappingComponent } from './node-mapping.component';

describe('NodeMappingComponent', () => {
  let component: NodeMappingComponent;
  let fixture: ComponentFixture<NodeMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NodeMappingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

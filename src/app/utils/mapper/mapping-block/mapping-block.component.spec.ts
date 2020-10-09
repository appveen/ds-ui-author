import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingBlockComponent } from './mapping-block.component';

describe('MappingBlockComponent', () => {
  let component: MappingBlockComponent;
  let fixture: ComponentFixture<MappingBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MappingBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

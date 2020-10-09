import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TraverseBlockComponent } from './traverse-block.component';

describe('TraverseBlockComponent', () => {
  let component: TraverseBlockComponent;
  let fixture: ComponentFixture<TraverseBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TraverseBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TraverseBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

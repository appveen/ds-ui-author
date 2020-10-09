import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeboundBlockComponent } from './timebound-block.component';

describe('TimeboundBlockComponent', () => {
  let component: TimeboundBlockComponent;
  let fixture: ComponentFixture<TimeboundBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeboundBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeboundBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

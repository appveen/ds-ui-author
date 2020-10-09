import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReqNodeComponent } from './req-node.component';

describe('ReqNodeComponent', () => {
  let component: ReqNodeComponent;
  let fixture: ComponentFixture<ReqNodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReqNodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReqNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

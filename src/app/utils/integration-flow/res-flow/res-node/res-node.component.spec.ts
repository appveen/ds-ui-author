import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResNodeComponent } from './res-node.component';

describe('ResNodeComponent', () => {
  let component: ResNodeComponent;
  let fixture: ComponentFixture<ResNodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResNodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

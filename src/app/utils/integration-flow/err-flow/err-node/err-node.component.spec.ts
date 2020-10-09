import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrNodeComponent } from './err-node.component';

describe('ErrNodeComponent', () => {
  let component: ErrNodeComponent;
  let fixture: ComponentFixture<ErrNodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrNodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

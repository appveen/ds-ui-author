import { ComponentFixture, TestBed } from '@angular/core/testing';

import { B2bFlowsManageComponent } from './b2b-flows-manage.component';

describe('B2bFlowsManageComponent', () => {
  let component: B2bFlowsManageComponent;
  let fixture: ComponentFixture<B2bFlowsManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ B2bFlowsManageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(B2bFlowsManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

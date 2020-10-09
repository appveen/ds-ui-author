import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NanoServiceManageComponent } from './nano-service-manage.component';

describe('NanoserviceManageComponent', () => {
  let component: NanoServiceManageComponent;
  let fixture: ComponentFixture<NanoServiceManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NanoServiceManageComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NanoServiceManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BotsManageComponent } from './bots-manage.component';

describe('BotsManageComponent', () => {
  let component: BotsManageComponent;
  let fixture: ComponentFixture<BotsManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BotsManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BotsManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreHookLogsComponent } from './pre-hook-logs.component';

describe('PreHookLogsComponent', () => {
  let component: PreHookLogsComponent;
  let fixture: ComponentFixture<PreHookLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreHookLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreHookLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

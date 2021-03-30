import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotsLogsComponent } from './bots-logs.component';

describe('BotsLogsComponent', () => {
  let component: BotsLogsComponent;
  let fixture: ComponentFixture<BotsLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BotsLogsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BotsLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

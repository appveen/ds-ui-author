import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalBotComponent } from './local-bot.component';

describe('LocalBotComponent', () => {
  let component: LocalBotComponent;
  let fixture: ComponentFixture<LocalBotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocalBotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

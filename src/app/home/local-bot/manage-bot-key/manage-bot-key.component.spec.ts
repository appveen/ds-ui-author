import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBotKeyComponent } from './manage-bot-key.component';

describe('ManageBotKeyComponent', () => {
  let component: ManageBotKeyComponent;
  let fixture: ComponentFixture<ManageBotKeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageBotKeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageBotKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

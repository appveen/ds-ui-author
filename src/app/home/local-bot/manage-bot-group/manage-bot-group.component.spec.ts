import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBotGroupComponent } from './manage-bot-group.component';

describe('ManageBotGroupComponent', () => {
  let component: ManageBotGroupComponent;
  let fixture: ComponentFixture<ManageBotGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageBotGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageBotGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

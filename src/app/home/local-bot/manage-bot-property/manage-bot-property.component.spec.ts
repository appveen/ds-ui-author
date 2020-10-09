import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBotPropertyComponent } from './manage-bot-property.component';

describe('ManageBotPropertyComponent', () => {
  let component: ManageBotPropertyComponent;
  let fixture: ComponentFixture<ManageBotPropertyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageBotPropertyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageBotPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

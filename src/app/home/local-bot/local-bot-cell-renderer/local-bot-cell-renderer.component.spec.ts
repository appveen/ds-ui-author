import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalBotCellRendererComponent } from './local-bot-cell-renderer.component';

describe('LocalBotCellRendererComponent', () => {
  let component: LocalBotCellRendererComponent;
  let fixture: ComponentFixture<LocalBotCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LocalBotCellRendererComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalBotCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

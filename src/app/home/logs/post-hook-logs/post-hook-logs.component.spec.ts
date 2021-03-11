import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostHookLogsComponent } from './post-hook-logs.component';

describe('PostHookLogsComponent', () => {
  let component: PostHookLogsComponent;
  let fixture: ComponentFixture<PostHookLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostHookLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostHookLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

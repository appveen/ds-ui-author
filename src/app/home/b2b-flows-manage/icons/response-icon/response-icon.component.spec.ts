import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseIconComponent } from './response-icon.component';

describe('ResponseIconComponent', () => {
  let component: ResponseIconComponent;
  let fixture: ComponentFixture<ResponseIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResponseIconComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResponseIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

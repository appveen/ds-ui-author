import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideCanvasComponent } from './side-canvas.component';

describe('SideCanvasComponent', () => {
  let component: SideCanvasComponent;
  let fixture: ComponentFixture<SideCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideCanvasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

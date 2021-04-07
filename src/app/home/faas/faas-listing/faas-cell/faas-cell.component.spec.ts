import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaasCellComponent } from './faas-cell.component';

describe('FaasCellComponent', () => {
  let component: FaasCellComponent;
  let fixture: ComponentFixture<FaasCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaasCellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaasCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataActualComponent } from './data-actual.component';

describe('DataActualComponent', () => {
  let component: DataActualComponent;
  let fixture: ComponentFixture<DataActualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataActualComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataActualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

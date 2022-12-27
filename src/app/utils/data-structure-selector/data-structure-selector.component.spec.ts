import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataStructureSelectorComponent } from './data-structure-selector.component';

describe('DataStructureSelectorComponent', () => {
  let component: DataStructureSelectorComponent;
  let fixture: ComponentFixture<DataStructureSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataStructureSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataStructureSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

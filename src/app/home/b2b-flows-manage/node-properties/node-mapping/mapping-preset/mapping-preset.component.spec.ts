import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingPresetComponent } from './mapping-preset.component';

describe('MappingPresetComponent', () => {
  let component: MappingPresetComponent;
  let fixture: ComponentFixture<MappingPresetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MappingPresetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MappingPresetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

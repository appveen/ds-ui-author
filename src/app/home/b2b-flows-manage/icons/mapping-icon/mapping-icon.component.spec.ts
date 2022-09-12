import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingIconComponent } from './mapping-icon.component';

describe('MappingIconComponent', () => {
  let component: MappingIconComponent;
  let fixture: ComponentFixture<MappingIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MappingIconComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MappingIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

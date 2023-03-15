import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapperFormulasComponent } from './mapper-formulas.component';

describe('MapperFormulasComponent', () => {
  let component: MapperFormulasComponent;
  let fixture: ComponentFixture<MapperFormulasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapperFormulasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapperFormulasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

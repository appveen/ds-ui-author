import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectServiceBlockComponent } from './select-service-block.component';

describe('SelectServiceBlockComponent', () => {
  let component: SelectServiceBlockComponent;
  let fixture: ComponentFixture<SelectServiceBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectServiceBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectServiceBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

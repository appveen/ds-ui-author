import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationPropertyComponent } from './relation-property.component';

describe('RelationPropertyComponent', () => {
  let component: RelationPropertyComponent;
  let fixture: ComponentFixture<RelationPropertyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelationPropertyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelationPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

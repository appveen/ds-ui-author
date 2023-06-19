import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDataserviceComponent } from './list-dataservice.component';

describe('ListDataserviceComponent', () => {
  let component: ListDataserviceComponent;
  let fixture: ComponentFixture<ListDataserviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListDataserviceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListDataserviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

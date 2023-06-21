import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemNodeComponent } from './system-node.component';

describe('SystemNodeComponent', () => {
  let component: SystemNodeComponent;
  let fixture: ComponentFixture<SystemNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemNodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

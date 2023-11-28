import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleMenuitemsMapComponent } from './role-menuitems-map.component';

describe('RoleMenuitemsMapComponent', () => {
  let component: RoleMenuitemsMapComponent;
  let fixture: ComponentFixture<RoleMenuitemsMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RoleMenuitemsMapComponent]
    });
    fixture = TestBed.createComponent(RoleMenuitemsMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

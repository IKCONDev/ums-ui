import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRoleMenuitemPermissionComponent } from './user-role-menuitem-permission.component';

describe('UserRoleMenuitemPermissionComponent', () => {
  let component: UserRoleMenuitemPermissionComponent;
  let fixture: ComponentFixture<UserRoleMenuitemPermissionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserRoleMenuitemPermissionComponent]
    });
    fixture = TestBed.createComponent(UserRoleMenuitemPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

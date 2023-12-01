import { Component, OnInit, Output, setTestabilityGetter } from '@angular/core';
import { EmployeeService } from '../employee/service/employee.service';
import { Router } from '@angular/router';
import { Employee } from '../model/Employee.model';
import { error } from 'jquery';
import { HttpStatusCode } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { UserRoleMenuItemPermissionService } from './service/user-role-menuitem-permission.service';
import { UserRoleMenuItemPermissionMap } from '../model/UserRoleMenuItemPermissionMap.model';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';
import { MenuItem } from '../model/MenuItem.model';
import { RoleService } from '../role/service/role.service';

@Component({
  selector: 'app-user-role-menuitem-permission',
  templateUrl: './user-role-menuitem-permission.component.html',
  styleUrls: ['./user-role-menuitem-permission.component.css']
})
export class UserRoleMenuitemPermissionComponent implements OnInit {

  @Output() title = "User Menu Item Permissions";
  employeeList: Employee[] = [];
  selectedUserId: string = localStorage.getItem('selectedUser')
  menuItemList: MenuItem[] = [];
  roleId: number;
  private table: any;
  loggedInUserRole: string = localStorage.getItem('userRole');

  constructor(private employeeService: EmployeeService, private router: Router,
    private toastr: ToastrService, private userRPMService: UserRoleMenuItemPermissionService,
    private menuItemService: AppMenuItemService,
    private roleService: RoleService) {
     if (this.loggedInUserRole != 'ADMIN' && this.loggedInUserRole != 'SUPER_ADMIN') {
      localStorage.clear();
      window.localStorage.clear();
      this.router.navigateByUrl('/unauthorized')
     }
  }

  ngOnInit(): void {
    this.getUsersList();
    this.getRoleMenuItemPermissionListByUserId();
    this.getAllMenuItems();
  }

  roleName: string;
  getRoleDetails(roleId: number) {
    this.roleService.getRole(roleId).subscribe({
      next: response => {
        if (response.status === HttpStatusCode.Ok) {
          this.roleName = response.body.roleName;
        }
      }
    })
  }

  getAllMenuItems() {
    this.menuItemService.findMenuItems().subscribe({
      next: response => {
        this.menuItemList = response.body;
        console.log(this.menuItemList)
      }
    })
  }

  getUsersList() {
    this.employeeService.getUserStatusEmployees(true).subscribe({
      next: response => {
        this.employeeList = response.body;
      }, error: error => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl('/session-timeout');
        } else {
          this.toastr.error('Error while fetching users list, Please reload the page again');
        }
      }
    })
  }

  //RPM - RolePermissionMenuItem
  userRPMMapList: UserRoleMenuItemPermissionMap[] = [];
  getRoleMenuItemPermissionListByUserId() {
    localStorage.setItem('selectedUser', this.selectedUserId);
    this.userRPMService.findUserRoleMenuitemPermissionMapsByUserId(this.selectedUserId).subscribe({
      next: response => {
        if (response.status === HttpStatusCode.Ok) {
          this.userRPMMapList = response.body;
          this.roleId = this.userRPMMapList[0].roleId;
          console.log(this.userRPMMapList)
          this.getRoleDetails(this.roleId);
          // setTimeout(() => {
          //   window.location.reload();
          // },1000)
        }
      }, error: error => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl('/session-timeout');
        } else {
          this.toastr.error('Error while fetching permissions list.');
        }
      }
    })
  }

  updatePermissionStatus(userRPMMap: UserRoleMenuItemPermissionMap, event: any, permissionValue: string) {
    var isconfirmed = window.confirm('Are you sure, you want to update the permission ?')
    if (isconfirmed) {
      if (event.target.checked === false) {
        var permissionList = userRPMMap.permissionIdList.split(',');
        var i = 0;
        permissionList.forEach(permission => {
          if (permission.trim() === permissionValue) {
            permissionList.splice(i, 1);
          }
          i++;
        })
        var newPermissionList = permissionList.join(',');
        userRPMMap.permissionIdList = newPermissionList;
        this.userRPMService.updateUserRoleMenuItemPermissionMap(userRPMMap).subscribe({
          next: response => {
            if (response.status === HttpStatusCode.PartialContent) {
              this.toastr.success('Permission updated.')
            }
          }
        })
      } else {
        var permissionList = userRPMMap.permissionIdList.split(',');
        permissionList.push(permissionValue.trim());
        var newPermissionList = permissionList.join(',');
        userRPMMap.permissionIdList = newPermissionList;
        this.userRPMService.updateUserRoleMenuItemPermissionMap(userRPMMap).subscribe({
          next: response => {
            if (response.status === HttpStatusCode.PartialContent) {
              this.toastr.success('Permission updated.')
            }
          }
        })
      }
    } else {
      this.toastr.warning('Permission not updated.')
      if (event.target.checked === true) {
        event.target.checked = false;
      } else {
        event.target.checked = true;
      }
    }
    console.log(userRPMMap)
  }

  checkChecked(userRPMMap: UserRoleMenuItemPermissionMap) {
    console.log('true')
  }

}

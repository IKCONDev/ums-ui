import { Component, OnInit, Output } from '@angular/core';
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

@Component({
  selector: 'app-user-role-menuitem-permission',
  templateUrl: './user-role-menuitem-permission.component.html',
  styleUrls: ['./user-role-menuitem-permission.component.css']
})
export class UserRoleMenuitemPermissionComponent implements OnInit {

  @Output() title = "User Menu Item Permissions";
  employeeList: Employee[] = [];
  selectedUserId: string = localStorage.getItem('email')
  menuItemList: MenuItem[] = [];

  constructor(private employeeService: EmployeeService, private router: Router,
    private toastr: ToastrService, private userRPMService: UserRoleMenuItemPermissionService,
    private menuItemService: AppMenuItemService){}

  ngOnInit(): void {
    this.getUsersList();
    this.getRoleMenuItemPermissionByUserId();
    this.getAllMenuItems();
  }

  getAllMenuItems(){
    this.menuItemService.findMenuItems().subscribe({
      next: response => {
        this.menuItemList = response.body;
        console.log(this.menuItemList)
      }
    })
  }

  getUsersList(){
    this.employeeService.getUserStatusEmployees(true).subscribe({
      next: response => {
        this.employeeList = response.body;
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }else{
          this.toastr.error('Error while fetching users list, Please reload the page again');
        }
      }
    })
  }

  //RPM - RolePermissionMenuItem
  userRPMMapList: UserRoleMenuItemPermissionMap[] = [];
  getRoleMenuItemPermissionByUserId(){
    this.userRPMService.findUserRoleMenuitemPermissionMapsByUserId(this.selectedUserId).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.userRPMMapList = response.body;
          console.log(this.userRPMMapList)
        }
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }else{
          this.toastr.error('Error while fetching permissions list.');
        }
      }
    })
  }

  updatePermissionStatus(id: number, event: any, permissionValue: string){
    
  }

  checkChecked(userRPMMap: UserRoleMenuItemPermissionMap){
    console.log('true')
  }

}

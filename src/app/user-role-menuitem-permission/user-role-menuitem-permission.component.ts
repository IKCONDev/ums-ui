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
import { lastValueFrom } from 'rxjs';

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

  addUserRPMMap: UserRoleMenuItemPermissionMap = new UserRoleMenuItemPermissionMap();
  addPermissionList: string[] = [];
  addPermissionIdListString: string;
  roleName: string;
  userRPMMapList: UserRoleMenuItemPermissionMap[] = [];
  unassignedMenuItemList: MenuItem[] = [];
  isUserRoleMenuItemPermissionText:boolean=false;
  isComponentLoading:boolean=false;

  viewPermission: boolean;
  createPermission: boolean;
  updatePermission: boolean;
  deletePermission: boolean;
  noPermissions: boolean;
  addButtonColor: string;
  deleteButtonColor: string;
  updateButtonColor: string;
  userRoleMenuItemsPermissionMap: Map<string, string>

  constructor(private employeeService: EmployeeService, private router: Router,
    private toastr: ToastrService, private userRPMService: UserRoleMenuItemPermissionService,
    private menuItemService: AppMenuItemService,
    private roleService: RoleService) {

     if (this.loggedInUserRole != 'ADMIN' && this.loggedInUserRole != 'SUPER_ADMIN') {
      this.router.navigateByUrl('/unauthorized')
     }
  }

  async ngOnInit(): Promise<void> {
    if(localStorage.getItem('jwtToken') === null){
      this.router.navigateByUrl('/session-timeout');
    }
    
    if (localStorage.getItem('userRoleMenuItemPermissionMap') != null) {
      this.userRoleMenuItemsPermissionMap = new Map(Object.entries(JSON.parse(localStorage.getItem('userRoleMenuItemPermissionMap'))));
    }
    //get menu item  details of home page
    var currentMenuItem = await this.getCurrentMenuItemDetails();
    console.log(currentMenuItem)

      if (this.userRoleMenuItemsPermissionMap.has(currentMenuItem.menuItemId.toString().trim())) {
        //this.noPermissions = false;
        //provide permission to access this component for the logged in user if view permission exists
        console.log('exe')
        //get permissions of this component for the user
        var menuItemPermissions = this.userRoleMenuItemsPermissionMap.get(this.currentMenuItem.menuItemId.toString().trim());
        if (menuItemPermissions.includes('View')) {
          this.viewPermission = true;
          this.getUsersList();
          this.getRoleMenuItemPermissionListByUserId();
          this.getAllMenuItems();
        }else{
          this.viewPermission = false;
        }
        if (menuItemPermissions.includes('Create')) {
          this.createPermission = true;
        }else{
          this.createPermission = false;
          this.addButtonColor = 'lightgrey'
        }
        if (menuItemPermissions.includes('Update')) {
          this.updatePermission = true;
          this.updateButtonColor = '#5590AA';
        }else{
          this.updatePermission = false;
          this.updateButtonColor = 'lightgray';
        }
        if (menuItemPermissions.includes('Delete')) {
          this.deletePermission = true;
        }else{
          this.deletePermission = false;
          this.deleteButtonColor = 'lightgray';
        }
      }else{
        //this.noPermissions = true;
        this.router.navigateByUrl('/unauthorized');
      }
  }

  /**
   * 
   * @param roleId 
   */
  getRoleDetails(roleId: number) {
    this.roleService.getRole(roleId).subscribe({
      next: response => {
        if (response.status === HttpStatusCode.Ok) {
          this.roleName = response.body.roleName;
        }
      }, error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }else{
          this.toastr.error('Error while fetching role details')
        }
      }
    })
  }

  /**
   * get all menu items list
   */
  async getAllMenuItems() : Promise<MenuItem[]>{
    this.menuItemService.findMenuItems().subscribe({
      next: response => {
        this.menuItemList = response.body;
        //this.unassignedMenuItemList = response.body;
        console.log(this.menuItemList)
      }
    })
    return this.menuItemList;
  }

  /**
   * 
   */
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
  /**
   * 
   */
  getRoleMenuItemPermissionListByUserId() {
    this.isComponentLoading=true;
    this.isUserRoleMenuItemPermissionText=true;
    localStorage.setItem('selectedUser', this.selectedUserId);
    this.userRPMService.findUserRoleMenuitemPermissionMapsByUserId(this.selectedUserId).subscribe({
      next: response => {
        if (response.status === HttpStatusCode.Ok) {
          this.userRPMMapList = response.body;
          this.isComponentLoading=false;
          this.isUserRoleMenuItemPermissionText=false;
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

  updateUserRoleMenuItemPermissionMap(userRPMMap: UserRoleMenuItemPermissionMap, event: any, permissionValue: string) {
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

  /**
   * clear error messages and existing values
   */
  clearErrorMessages(){
    this.addUserRPMMap.permissionIdList = null;
    this.addUserRPMMap.menuItemIdList = null;
    this.unassignedMenuItemList = [];
    console.log(this.unassignedMenuItemList)
  }

  /**
   * 
   */
  createUserRoleMenuItemPermissionMapForUser(){
    this.addUserRPMMap.email = this.selectedUserId;
    this.addUserRPMMap.permissionIdList = this.addPermissionIdListString;
    this.addUserRPMMap.roleId = this.roleId;
    console.log(this.addUserRPMMap)
    this.userRPMService.createUserRoleMenuItemPermissionMap(this.addUserRPMMap).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Created){
          this.toastr.success('Menu Item and permissions are added for user');
          setTimeout(() => {
            window.location.reload();
          },1000)
        }
      }, error: error => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl('/session-timeout');
        } else {
          this.toastr.error('Error while adding a menu item and permissions for user.');
        }
      }
    })
  }


  /**
   * 
   * @param event 
   * @param permissionAssigned 
   */
  setPermission(event: any, permissionAssigned){
    if(event.target.checked === true && (permissionAssigned === 'View' || permissionAssigned === 'Create' || permissionAssigned === 'Update' || permissionAssigned === 'Delete')){
      var addPermissionListString = this.addPermissionList.join(',');
      if(!addPermissionListString.includes(permissionAssigned)){
        this.addPermissionList.push(permissionAssigned);
      }
    }//if
    else{
      var addPermissionListString = this.addPermissionList.join(',');
      if(addPermissionListString.includes(permissionAssigned)){
        var i = 0;
        this.addPermissionList.forEach(permission => {
          console.log(permission)
          console.log(permissionAssigned)
          if(permission.toString().trim() === permissionAssigned.toString().trim()){
            this.addPermissionList.splice(i,1);
          }
          i = i+1;
        });
      }
    }//else
    this.addPermissionIdListString = this.addPermissionList.join(',');
  }

  /**
   * 
   */
  async showUnAssignedMenuItemsForUser(){
    await this.getAllMenuItems().then(value => {
      this.unassignedMenuItemList = value;
    }, reason => {
      this.toastr.error('Menu Items could not fetched for user '+reason);
    });
    this.userRPMMapList.forEach(userRPMMap => {
      var i = 0;
      this.unassignedMenuItemList.forEach(menuItem => {
        if(parseInt(userRPMMap.menuItemIdList.trim()) === menuItem.menuItemId){
          this.unassignedMenuItemList.splice(i,1);
          return;
        }
      })
      i = i+1;
    })
  }

  currentMenuItem: MenuItem;
  async getCurrentMenuItemDetails() : Promise<MenuItem> {
      const response =  await lastValueFrom(this.menuItemService.findMenuItemByName('User Menu Item Permissions')).then(response => {
        if (response.status === HttpStatusCode.Ok) {
          this.currentMenuItem = response.body;
          console.log(this.currentMenuItem)
        }else if(response.status === HttpStatusCode.Unauthorized){
          console.log('eit')
          this.router.navigateByUrl('/session-timeout');
        }
      },reason => {
        if(reason.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }
      }
      )
    console.log(this.currentMenuItem);
    return this.currentMenuItem;
  }

}

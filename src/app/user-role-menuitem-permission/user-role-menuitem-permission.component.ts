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

  @Output() title = "Assign Menu Items & Permissions";
  employeeList: Employee[] = [];
  selectedUserId: string = localStorage.getItem('selectedUser')
  menuItemList: MenuItem[] = [];
  roleId: number;
  private table: any;
  loggedInUserRole: string = localStorage.getItem('userRole');

  addUserRPMMap: UserRoleMenuItemPermissionMap = new UserRoleMenuItemPermissionMap();
  addPermissionList: string[] = [];
  addPermissionIdListString: string = null;
  roleName: string;
  userRPMMapList: UserRoleMenuItemPermissionMap[] = [];
  unassignedMenuItemList: MenuItem[] = [];
  isUserRoleMenuItemPermissionText: boolean = false;
  isComponentLoading: boolean = false;

  viewPermission: boolean;
  createPermission: boolean;
  updatePermission: boolean;
  deletePermission: boolean;
  noPermissions: boolean;
  addButtonColor: string;
  deleteButtonColor: string;
  updateButtonColor: string;
  userRoleMenuItemsPermissionMap: Map<string, string>
  currentMenuItem: MenuItem;

  constructor(private employeeService: EmployeeService, private router: Router,
    private toastr: ToastrService, private userRPMService: UserRoleMenuItemPermissionService,
    private menuItemService: AppMenuItemService,
    private roleService: RoleService) {
  }

  /**
   * initialize the view of the component as soon as the component is loaded
   */
  async ngOnInit(): Promise<void> {

    // if (this.loggedInUserRole != 'ADMIN' && this.loggedInUserRole != 'SUPER_ADMIN') {
    //   this.router.navigateByUrl('/unauthorized')
    //  }

    //if the session of user is null, redirect to session-timeout
    if (localStorage.getItem('jwtToken') === null) {
      this.router.navigateByUrl('/session-timeout');
    }

    //check wether the user has previlages(permissions) to view the component
    if (localStorage.getItem('userRoleMenuItemPermissionMap') != null) {
      this.userRoleMenuItemsPermissionMap = new Map(Object.entries(JSON.parse(localStorage.getItem('userRoleMenuItemPermissionMap'))));
    }
    //get menu item  details of home page
    var currentMenuItem = await this.getCurrentMenuItemDetails();

    if (this.userRoleMenuItemsPermissionMap.has(currentMenuItem.menuItemId.toString().trim())) {
      //this.noPermissions = false;
      //provide permission to access this component for the logged in user if view permission exists
      //get permissions of this component for the user
      var menuItemPermissions = this.userRoleMenuItemsPermissionMap.get(this.currentMenuItem.menuItemId.toString().trim());
      if (menuItemPermissions.includes('View')) {
        this.viewPermission = true;
        //fetch details from db is view permission exists for ther user
        this.getUsersList();
        this.getRoleMenuItemPermissionListByUserId();
        this.getAllMenuItems();
      } else {
        this.viewPermission = false;
      }
      if (menuItemPermissions.includes('Create')) {
        this.createPermission = true;
      } else {
        this.createPermission = false;
        this.addButtonColor = 'lightgrey'
      }
      if (menuItemPermissions.includes('Update')) {
        this.updatePermission = true;
        this.updateButtonColor = '#5590AA';
      } else {
        this.updatePermission = false;
        this.updateButtonColor = 'lightgray';
      }
      if (menuItemPermissions.includes('Delete')) {
        this.deletePermission = true;
      } else {
        this.deletePermission = false;
        this.deleteButtonColor = 'lightgray';
      }
    } else {
      //this.noPermissions = true;
      this.router.navigateByUrl('/unauthorized');
    }
  }

  /**
   * get the role details based on the provided roleId (record Id in database)
   * @param roleId 
   */
  getRoleDetails(roleId: number) {
    this.roleService.getRole(roleId).subscribe({
      next: response => {
        if (response.status === HttpStatusCode.Ok) {
          this.roleName = response.body.roleName;
        }
      }, error: error => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl('/session-timeout');
        } else {
          this.toastr.error('Error while fetching role details')
        }
      }
    })
  }

  /**
   * get all menu items list of UMS application
   */
  async getAllMenuItems(): Promise<MenuItem[]> {
    //await for the promised result to execute further
    await lastValueFrom(this.menuItemService.findMenuItems()).then(
      response => {
        if (response.status === HttpStatusCode.Ok) {
          this.menuItemList = response.body;
        } else if (response.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl('/session-timeout')
        }
      }
    )
    return this.menuItemList;
  }

  /**
   * get the list of all employees, if and only if the user status of the employee is true.
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
    this.isComponentLoading = true;
    this.isUserRoleMenuItemPermissionText = true;
    var previousUserId = localStorage.getItem('selectedUser');
    console.log(previousUserId)
    console.log(this.selectedUserId)
    if(this.selectedUserId === null || this.selectedUserId === ''){
      this.roleName = '';
      localStorage.setItem('selectedUser',previousUserId);
    }else{
      localStorage.setItem('selectedUser', this.selectedUserId);
    }
    this.userRPMService.findUserRoleMenuitemPermissionMapsByUserId(this.selectedUserId).subscribe({
      next: response => {
        if (response.status === HttpStatusCode.Ok) {
          this.userRPMMapList = response.body;
          this.isComponentLoading = false;
          this.isUserRoleMenuItemPermissionText = false;
          this.roleId = this.userRPMMapList[0].roleId;
          this.getRoleDetails(this.roleId);
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
  }

  /**
   * clear error messages and existing values
   */
  clearErrorMessages() {
    this.addUserRPMMap.permissionIdList = null;
    this.addUserRPMMap.menuItemIdList = null;
    this.unassignedMenuItemList = [];
    window.location.reload();
  }

  /**
   * 
   */
  createUserRoleMenuItemPermissionMapForUser() {
    if( this.addPermissionIdListString != null  && this.addPermissionIdListString.includes('View')){
       this.addUserRPMMap.email = this.selectedUserId;
       this.addUserRPMMap.permissionIdList = this.addPermissionIdListString;
       this.addUserRPMMap.roleId = this.roleId;
       this.userRPMService.createUserRoleMenuItemPermissionMap(this.addUserRPMMap).subscribe({
         next: response => {
           if (response.status === HttpStatusCode.Created) {
             this.toastr.success('Menu Item and permissions are added for user');
            //  document.getElementById('closeUpdateModal').click();
            window.location.reload();
             // setTimeout(() => {
             //  window.location.reload();
             // }, 1000)
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
    else{
       this.toastr.warning("Please select 'View' permission")
    }
    
  }


  /**
   * 
   * @param event 
   * @param permissionAssigned 
   */
  setPermission(event: any, permissionAssigned) {
    if (event.target.checked === true && (permissionAssigned === 'View' || permissionAssigned === 'Create' || permissionAssigned === 'Update' || permissionAssigned === 'Delete')) {
      var addPermissionListString = this.addPermissionList.join(',');
      if (!addPermissionListString.includes(permissionAssigned)) {
        this.addPermissionList.push(permissionAssigned);
      }
    }//if
    else {
      var addPermissionListString = this.addPermissionList.join(',');
      if (addPermissionListString.includes(permissionAssigned)) {
        var i = 0;
        this.addPermissionList.forEach(permission => {
          if (permission.toString().trim() === permissionAssigned.toString().trim()) {
            this.addPermissionList.splice(i, 1);
          }
          i = i + 1;
        });
      }
    }//else
    //contains the  new permission list updated for the user
    this.addPermissionIdListString = this.addPermissionList.join(',');
  }

  /**
   * 
   */
  isUserSelected: boolean = false;
  async showUnAssignedMenuItemsForUser() {
    if(this.selectedUserId === '' || this.selectedUserId === null){
      this.toastr.warning('Select a user');
      return;
    }
    this.isUserSelected = true;
    this.unassignedMenuItemList = await this.getAllMenuItems();
    for (var i = 0; i < this.userRPMMapList.length; i++) {
      for (var j = 0; j < this.unassignedMenuItemList.length; j++) {
        if (this.unassignedMenuItemList[j].menuItemId === parseInt(this.userRPMMapList[i].menuItemIdList.trim())) {
          this.unassignedMenuItemList.splice(j, 1);
          break;
        }
      }
    }
  }


  /**
   * 
   * @returns 
   */
  async getCurrentMenuItemDetails(): Promise<MenuItem> {
    const response = await lastValueFrom(this.menuItemService.findMenuItemByName('Assign Menu Items & Permissions')).then(response => {
      if (response.status === HttpStatusCode.Ok) {
        this.currentMenuItem = response.body;
      } else if (response.status === HttpStatusCode.Unauthorized) {
        this.router.navigateByUrl('/session-timeout');
      }
    }, reason => {
      if (reason.status === HttpStatusCode.Unauthorized) {
        this.router.navigateByUrl('/session-timeout')
      }
    }
    )
    return this.currentMenuItem;
  }

}

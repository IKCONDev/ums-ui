import { AfterViewInit, Component, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { UserService } from './service/users.service';
import { Users } from '../model/Users.model';
import { MsalInterceptorAuthRequest } from '@azure/msal-angular';
import { HttpStatusCode } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { RoleService } from '../role/service/role.service';
import { Role } from '../model/Role.model';
import { MeetingService } from '../meetings/service/meetings.service';
import { Router } from '@angular/router';
import { EmployeeService } from '../employee/service/employee.service';
import { Employee } from '../model/Employee.model';
import { MenuItem } from '../model/MenuItem.model';
import { lastValueFrom } from 'rxjs';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';
import { error } from 'jquery';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, AfterViewInit, OnDestroy {

  private table: any;
  loggedInUser: string = localStorage.getItem('email');
  loggedInUserRole = localStorage.getItem('userRole');
  @Output() title: string = 'Users';
  userList: Users[];
  userDetails: any;
  isComponentLoading: boolean = false;
  isUserDataText: boolean = false;
  roles: Role[];
  userEmailIdList: string[];
  employeeData: Employee[];
  employee: Employee;
  currentMenuItem: MenuItem;
  initialRoleList: Role[]
  unAssignedRoles: any[] 
  previousRole: any;
  display: string = 'block'
  employeeWithStatus: Employee[]
  existingUserObj = {
    id: 0,
    email: '',
    userRoles: [
      {
        roleId: 0,
        roleName: '',
        roleDescription: '',
        roleStatus: ''
      }
    ],
    active: false,
    otpCode: 0,
    twoFactorAuthentication: false,
    profilePic: null,
    firstName: '',
    lastName: '',
    userOrgId: ''
  }
  addUserObj = {
    email: '',
    userRoles: [
      {
        roleId: 0,
        roleName: '',
        roleStatus: 'Active'
      }
    ],
    active: false,
    otpCode: 0,
    twoFactorAuthentication: false,
    profilePic: null
  }

  /**
   * 
   * @param userService 
   * @param toastr 
   * @param roleService 
   * @param meetingsService 
   * @param router 
   * @param employeeservice 
   */
  constructor(private userService: UserService, private toastr: ToastrService, private roleService: RoleService,
    private meetingsService: MeetingService, private router: Router, private employeeservice: EmployeeService,
    private menuItemService: AppMenuItemService) { }

  /**
   * 
   */
  viewPermission: boolean;
  createPermission: boolean;
  updatePermission: boolean;
  deletePermission: boolean;
  noPermissions: boolean;
  userRoleMenuItemsPermissionMap: Map<string, string>
  updateButtonColor: string;
  deleteButtonColor: string;
  addButtonColor: string;

  async ngOnInit(): Promise<void> {
    // if(this.loggedInUserRole != 'ADMIN' && this.loggedInUserRole != 'SUPER_ADMIN'){
    //   this.router.navigateByUrl('/unauthorized')
    //   return;
    // }

    if (localStorage.getItem('jwtToken') === null) {
      this.router.navigateByUrl('/session-timeout');
    }

    if (localStorage.getItem('userRoleMenuItemPermissionMap') != null) {
      this.userRoleMenuItemsPermissionMap = new Map(Object.entries(JSON.parse(localStorage.getItem('userRoleMenuItemPermissionMap'))));
    }
    //get menu item  details of home page
    var currentMenuItem = await this.getCurrentMenuItemDetails();
    console.log(currentMenuItem)

    if (this.userRoleMenuItemsPermissionMap.has(currentMenuItem.menuItemId.toString().trim())) {
      this.noPermissions = false;
      //provide permission to access this component for the logged in user if view permission exists
      console.log('exe')
      //get permissions of this component for the user
      var menuItemPermissions = this.userRoleMenuItemsPermissionMap.get(this.currentMenuItem.menuItemId.toString().trim());
      if (menuItemPermissions.includes('View')) {
        this.viewPermission = true;
        //get details to show in view
        this.getAllEmployeesWithStatus();
        this.getAllUsers();
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
      this.router.navigateByUrl('/unauthorized');
      // this.noPermissions = true;
    }
  }

  /**
   * 
   */
  getAllUsers() {

    this.userService.getAll().subscribe(
      response => {

        this.userList = response.body;
        console.log(this.userList);

      });

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      $(document).ready(() => {
        this.table = $('#myTable').DataTable({
          paging: true,
          searching: true, // Enable search feature
          pageLength: 10,
          order: [[1, 'asc']],
          lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
          columnDefs:[{
            "targets":[4,5,6] ,
            "orderable":false
          }]
          // Add other options here as needed
        });
      });
    }, 400)
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
    }
  }

  checkToggleButton(user: Users, i: number) {

    var table = document.getElementById("myTable")
    var rows = table.getElementsByTagName("tr");

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      //var checkbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;
      var checkbox = document.getElementById('slider' + i) as HTMLInputElement;
      console.log(checkbox)
      if (checkbox.checked == true) {

        user.active = true;

      }
      else {
        user.active = false;
        console.log("de-selected")
      }

    }
  }

  /**
   * 
   * @param user 
   * @param i 
   */
  checkUserTogglebuttonEnabled(user: Users, i: number) {

    //var table = document.getElementById('myTable');
    // var rows = table.getElementsByTagName("tr");
    var checkbox = document.getElementById('slider' + i) as HTMLInputElement
    console.log("checkbox method is executed" + "slider" + i + checkbox.checked);
    if (!checkbox.checked) {
      user.active = false;
      this.userService.update(user).subscribe(res => {
        this.userDetails = res.body;
      })
      localStorage.setItem('slider', 'false')
    }
    else {
      user.active = true;
      user.loginAttempts = 0;
      this.userService.update(user).subscribe(res => {
        this.userDetails = res.body;
      })

    }
  }


  createUser() {

    let isEmailId = true;
    let isRoleName = true;

    if (!this.isEmailValid) {
      var valid = this.validateUserEmailId();
      isEmailId = valid;
    }
    if (!this.isRoleNameValid) {
      var valid = this.validateuserRole();
      isRoleName = valid;

    }

    if (isEmailId == true && isRoleName == true) {
      console.log("create user Object" + this.addUserObj.userRoles[0]);
      //set role based on role id
      console.log(this.addUserObj.userRoles[0].roleId)
      this.roles.filter(role => {
        console.log(role.roleId)
        if (this.addUserObj.userRoles[0].roleId.toString() === role.roleId.toString()) {
          this.addUserObj.userRoles[0].roleName = role.roleName;
          console.log(role.roleName);
        }
      })
      this.addUserObj.userRoles[0].roleStatus = 'Active';
      this.userService.createUser(this.addUserObj).subscribe(
        response => {

          if (response.status == HttpStatusCode.Created) {
            this.addUserObj = response.body;
            this.toastr.success("User added successfully.");
            document.getElementById('closeAddModal').click();
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }

        }
      )

    }
    //this.addUserObj.userRoles.at(0).roleName; 
  }


  fetchOneUser(email: string) {
    console.log(email);
    this.userService.getSingleUser(email).subscribe(
      response => {
        this.existingUserObj = response.body;
        console.log(this.existingUserObj);
        //get employee details of the user
        this.getEmployee(this.existingUserObj.email);
      }
    )
    //   this.roles.filter(role =>{
    //     if(this.existingUserObj.userRoles[0].roleId.toString() === role.roleId.toString()){
    //        this.existingUserObj.userRoles[0].roleName = role.roleName;
    //     }
    //  })
  }

  /**
   * get roles
   */
  getAllRoles() {
    this.roleService.getAllRoles().subscribe(
      response => {
        this.roles = response.body;
        // this.unAssignedRoles = response.body;
        console.log(" roles:" + this.roles);
      }
    )

  }
  /**
   * 
   * @param user
   */
  updateUser(existinguser: any) {
    console.log(existinguser)
    let isEmailIdValid = true;
    let isRoleValid = true;
    if (!this.isUpdateRoleNameValid) {
      var valid = this.validateUpdateUserRole();
      isRoleValid = valid;
    }
    if (isRoleValid == true) {
      console.log(this.existingUserObj)
      console.log(this.existingUserObj.userRoles[0].roleId);
      this.roles.forEach(role => {
        console.log('loop ---' + role.roleId + "--- " + role.roleName)
        //get role name of the role id and attach to existing user
        if (role.roleId == this.existingUserObj.userRoles[0].roleId) {
          this.existingUserObj.userRoles[0].roleName = role.roleName;
        }
      })
      this.userService.update(this.existingUserObj).subscribe(
        response => {
          var userRecord = response.body;
          if (response.status == HttpStatusCode.Created) {
            this.toastr.success("User" + existinguser.roleId + " updated successfully.");
            document.getElementById('closeUpdateModal').click();
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
          else {
            this.toastr.error("Error occured while updating user " + existinguser.roleId + ". Please try again !");
          }
        }
      )

    }

  }

  /**
   *  delete user
   */
  removeUser(useremailId: any) {
    var isconfirmed = window.confirm("Are you sure, you really want to delete user ?");
    if (isconfirmed) {

      this.userService.deleteUser(useremailId).subscribe(
        response => {
          var userRecord = response.body;
          if (response.status == HttpStatusCode.Ok) {
            this.toastr.success("User '" + useremailId + "' deleted successfully.");
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
          else {
            this.toastr.error("Error occued while deleting user '" + useremailId + "' . Please try again !");
          }

        });
    }
    else {
      this.toastr.warning("User '" + useremailId + "' not deleted.");
    }


  }

  /**
   * validate create User
   */
  isEmailValid = false;
  useremailIdErrorInfo = "";
  validateUserEmailId() {
    var emailRegExp = /^[A-Za-z0-9._]{2,30}[0-9]{0,9}@[A-Za-z]{3,12}[.]{1}[A-Za-z.]{2,6}$/;
    //emailRegExp.test(this.addUserObj.email)===false
    if (this.addUserObj.email == '') {
      this.useremailIdErrorInfo = "Email ID is required.";
      this.isEmailValid = false;
    }
    else {
      this.useremailIdErrorInfo = '';
      this.isEmailValid = true;
    }
    return this.isEmailValid;
  }

  isRoleNameValid = false;
  roleErrorInfo = "";
  validateuserRole() {
    if (this.addUserObj.userRoles.at(0).roleId == 0) {
      this.roleErrorInfo = 'Role is required.';
      this.isRoleNameValid = false;
    }
    else if (this.addUserObj.userRoles.at(0).roleName.toString() === 'select') {
      this.roleErrorInfo = 'Role is required for select.';
      this.isRoleNameValid = false;
    }
    else {
      this.roleErrorInfo = '';
      this.isRoleNameValid = true;
    }
    return this.isRoleNameValid;
  }

  clearErrorMessages() {
    //$(".modal-body input").val("")
    this.roleErrorInfo = '';
    this.useremailIdErrorInfo = '';
    this.addUserObj.userRoles.at(0).roleId = 0;
    this.addUserObj.email = '';
    this.isEmailValid = false;
    this.isRoleNameValid = false;
  }


  /**
   * get the list of active users
   */
  getActiveUMSUsersEmailIdList() {
    //perform an AJAX call to get list of users
    var isActive: boolean = true;
    this.meetingsService.getActiveUserEmailIdList().subscribe({
      next: (response) => {
        this.userEmailIdList = response.body;
        console.log(response.body);
        console.log(this.userEmailIdList);
      }, error: (error) => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl("/session-timeout")
        }
      }//error
    })
  }

  /**
   * 
   */
  getAllEmployees() {
    this.employeeservice.getAll().subscribe({
      next: response => {
        this.employeeData = response.body;
        console.log(this.employeeData);
      },
      error: error => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl('/session-timeout');
        }
      }
    })
  }


  getEmployee(email: string) {
    this.employeeservice.getEmployee(email).subscribe({
      next: response => {
        if (response.status === HttpStatusCode.Ok) {
          this.employee = response.body;
          this.existingUserObj.firstName = this.employee.firstName;
          this.existingUserObj.lastName = this.employee.lastName;
          this.existingUserObj.userOrgId = this.employee.employeeOrgId;
        }
      }, error: error => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl('/session-timeout');
        }
      }
    })
  }

  getAllEmployeesWithStatus() {
    this.isComponentLoading = true;
    this.isUserDataText = true;
    this.employeeservice.getAllEmployeeStatus().subscribe({
      next: response => {
        this.employeeWithStatus = response.body;
        this.isComponentLoading = false;
        this.isUserDataText = false;
        console.log(this.employeeWithStatus)
      },
      error: error => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl('/session-timeout');
        }
      }
    })
  }
  isUpdateRoleNameErrorInfo = '';
  isUpdateRoleNameValid = false;
  validateUpdateUserRole() {
    if (this.existingUserObj.userRoles.at(0).roleId == 0) {
      this.isUpdateRoleNameErrorInfo = 'Role is required';
      this.isUpdateRoleNameValid = false;
    }
    else {
      this.isUpdateRoleNameErrorInfo = '';
      this.isUpdateRoleNameValid = true;
    }
    return this.isUpdateRoleNameValid;
  }

  /**
   * 
   * @returns 
   */
  async getCurrentMenuItemDetails(): Promise<MenuItem> {
    const response = await lastValueFrom(this.menuItemService.findMenuItemByName('Users')).then(response => {
      if (response.status === HttpStatusCode.Ok) {
        this.currentMenuItem = response.body;
        console.log(this.currentMenuItem)
      } else if (response.status === HttpStatusCode.Unauthorized) {
        console.log('eit')
        this.router.navigateByUrl('/session-timeout');
      }
    }, reason => {
      if (reason.status === HttpStatusCode.Unauthorized) {
        this.router.navigateByUrl('/session-timeout')
      }
    }
    )
    console.log(this.currentMenuItem);
    return this.currentMenuItem;
  }

  getAllUnassignedRoles() {
    this.roleService.getAllRoles().subscribe({
      next: response => {
        if (response.status === HttpStatusCode.Ok) {
          this.initialRoleList = response.body;
          for (var i = 0; i < this.initialRoleList.length; i++) {
            if (this.existingUserObj.userRoles[0].roleId === this.initialRoleList[i].roleId) {
              this.initialRoleList.splice(i, 1);
              this.unAssignedRoles = this.initialRoleList;
              console.log(this.unAssignedRoles)
              console.log
            }
          }
        }
      }
    })
  }

  /**
   * 
   * @param user
   */
  updateUserObj(role: any) {
    var oldRole = this.existingUserObj.userRoles[0].roleName;
    var newRole = role.roleName
    var confirmed = window.confirm('Are you sure, you want to update the role of this user from ' + oldRole + ' to ' + newRole + ' ?');
    if (confirmed) {
      var previousRole = this.existingUserObj.userRoles[0]
      this.existingUserObj.userRoles[0].roleId = role.roleId;
      this.roles.forEach(role => {
        //get role name of the role id and attach to existing user
        if (role.roleId == this.existingUserObj.userRoles[0].roleId) {
          this.existingUserObj.userRoles[0].roleName = role.roleName;
        }
      });
      this.userService.update(this.existingUserObj).subscribe(
        response => {
          var userRecord = response.body;
          if (response.status == HttpStatusCode.Created) {
            //this.getAllRoles();
            this.toastr.success('Role ' + this.existingUserObj.userRoles[0].roleName + ' updated for the user successfully.');
            document.getElementById('closeUpdateModal').click();
            for (var i = 0; i < this.unAssignedRoles.length; i++) {
              console.log(previousRole)
              if (this.existingUserObj.userRoles[0].roleId === this.unAssignedRoles[i].roleId) {
                this.unAssignedRoles.splice(i, 1);
                this.unAssignedRoles.push(previousRole)
                this.display = 'block';
                this.getAllUnassignedRoles();
                break;
              }
            }
            //  setTimeout(() => {
            //    window.location.reload();
            //   },1000);
          }
          else {
            this.toastr.error("Error occured while updating user");
          }
        }
      )
    } else {
     // this.toastr.warning('Role not updated.')
    }
  }

  /**
   * 
   * @param userRole 
   */
  removeRoleTemporary(userRole: any) {
    var isConfirmed = window.confirm('Are you sure, you want to unassign this role ' + userRole.roleName + ' ?');
    if (isConfirmed) {
      console.log(userRole)
      this.unAssignedRoles.push(userRole)
      this.display = 'none'
      this.toastr.warning('Please assign a new role for this user !. Previous role will be assigned automcatically, if new role is not assigned.')
    } else {
      this.toastr.warning('Operation cancelled.')
    }
  }

  /**
   * 
   */
  closeModal() {
    window.location.reload();
  }

}





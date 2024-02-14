
import { Component, AfterViewInit, OnDestroy, OnInit, Output, AfterViewChecked } from '@angular/core';
import * as $ from 'jquery';
import 'datatables.net';
import { RoleService } from './service/role.service';
import { Role } from '../model/Role.model';
import { ToastrService } from 'ngx-toastr';
import { HttpStatusCode } from '@angular/common/http';
import { error } from 'jquery';
import { Router } from '@angular/router';
import { PermissionService } from '../permission/service/permission.service';
import { Permission } from '../model/Permission.model';
import { MenuItem } from '../model/MenuItem.model';
import { lastValueFrom } from 'rxjs';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';


@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})

export class RoleComponent implements OnInit,AfterViewChecked,OnDestroy {

  private table: any;
  loggedInUserRole = localStorage.getItem('userRole')

  roleList: any[];
  @Output() title: string = 'Roles';
  createdRole: Role
  //roleList: Role[];

  //new role object
  addRoleObj = {
    roleId: 0,
    roleName: '',
    createdBy: '',
    createdByEmailId: '',
    createdDateTime: new Date(Date.now()),
    modifiedBy: '',
    modifiedByEmailId: '',
    modifiedDateTime: Date,
    permission: {
      permissionId:0,
    }
  }

  //existing db role obj
  existingRole = {
    roleId: 0,
    roleName: '',
    createdBy: '',
    createdByEmailId: '',
    createdDateTime: '',
    modifiedBy: '',
    modifiedByEmailId: '',
    modifiedDateTime: '',
    permission: {
      permissionId:0,
      permissionValue:'',
      permissionStatus:'',
    }
  }

  permissionList: Permission[];
  isComponentLoading:boolean=false;
  isRoleDataText:boolean=false;

  viewPermission: boolean;
  createPermission: boolean;
  updatePermission: boolean;
  deletePermission: boolean;
  noPermissions: boolean;
  addButtonColor: string;
  deleteButtonColor: string;
  updateButtonColor: string;
  userRoleMenuItemsPermissionMap: Map<string, string>

  /**
   * 
   * @param roleService 
   * @param toastr 
   */
  constructor(private roleService: RoleService, private toastr: ToastrService,
    private router: Router, private permissionService: PermissionService,
    private menuItemService: AppMenuItemService) {

  }

  async ngOnInit(): Promise<void> {

    // if(this.loggedInUserRole != 'ADMIN' && this.loggedInUserRole != 'SUPER_ADMIN'){
    //   this.router.navigateByUrl('/unauthorized')
    // }

    if(localStorage.getItem('jwtToken') === null){
      this.router.navigateByUrl('/session-timeout');
    }
    
    if (localStorage.getItem('userRoleMenuItemPermissionMap') != null) {
      this.userRoleMenuItemsPermissionMap = new Map(Object.entries(JSON.parse(localStorage.getItem('userRoleMenuItemPermissionMap'))));
    }
    //get menu item  details of home page
    var currentMenuItem = await this.getCurrentMenuItemDetails();
      if (this.userRoleMenuItemsPermissionMap.has(currentMenuItem.menuItemId.toString().trim())) {
        this.noPermissions = false;
        //provide permission to access this component for the logged in user if view permission exists
        //get permissions of this component for the user
        var menuItemPermissions = this.userRoleMenuItemsPermissionMap.get(this.currentMenuItem.menuItemId.toString().trim());
        if (menuItemPermissions.includes('View')) {
          this.viewPermission = true;
          this.getRoleList();
          this.getPermissionsList();
        }else{
          this.viewPermission = false;
        }
        if (menuItemPermissions.includes('Create')) {
          this.createPermission = true;
        }else{
          this.createPermission = false;
          this.addButtonColor = 'lightgray'
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
        this.noPermissions = true;
        this.router.navigateByUrl('/unauthorized');
      }
  }

  getPermissionsList(){
    this.permissionService.getAllPermissions().subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.permissionList = response.body;
        }
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      }
    })
  }

  initializeDataTable:boolean=false;
  ngAfterViewChecked(): void {
    this.initializeJqueryTable();

  }
  initializeJqueryTable(){
    if(this.roleDataLoaded&&!this.initializeDataTable){
    this.table = $('#dataTable').DataTable({
      paging: true,
      stateSave:true,
      searching: true, // Enable search feature
      pageLength: 10,
      order: [[1,'asc']],
      lengthMenu: [ [10, 25, 50, -1], [10, 25, 50, "All"] ],
      columnDefs:[{
        "targets": [0,8,9],
        "orderable":false
      }]
      // Add other options here as needed
    });
    this.initializeDataTable=true;
  }
}

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
    }
  }

  roleNameErrorInfo: string = ''
  isRoleNameValid: boolean = false;
  /**
   * 
   * @returns 
   */
  validateRoleName() {
    const regex = /^\S.*[a-zA-Z\s]*$/;
    if (this.addRoleObj.roleName === '' || this.addRoleObj.roleName.trim()==="" || regex.exec(this.addRoleObj.roleName)===null) {
      this.roleNameErrorInfo = 'Role name is required';
      this.isRoleNameValid=false;
    } else if (this.addRoleObj.roleName.length < 3) {
      this.roleNameErrorInfo = 'Role name should have min of 3 characters'
      this.isRoleNameValid=false;
    }else if (this.addRoleObj.roleName.length > 50){
      this.roleNameErrorInfo = 'Role name should not exceed more than 50 characters'
      this.isRoleNameValid=false;
    }
     else {
      this.roleNameErrorInfo = '';
      this.isRoleNameValid = true;
    }
    return this.isRoleNameValid;
  }

  permissionValueErrorInfo = ''
  isPermissionValueValid = false;
  validatePermissionValue(){
    if(this.addRoleObj.permission.permissionId.toString() === "0"){
      this.permissionValueErrorInfo = 'Please choose a permission'
      this.isPermissionValueValid = false;
    }else{
      this.permissionValueErrorInfo = '';
      this.isPermissionValueValid = true;
    }
    return this.isPermissionValueValid;
  }

  updatedRoleNameErrorInfo: string = '';
  isUpdatedRoleNameValid = false;
  updatePermissionValueErrorInfo: string = '';
  isUpdatePermissionValueValid = false;
  /**
   * 
   * @returns 
   */
  validateUpdatedRoleName() {
    const regex = /^\S.*[a-zA-Z\s]*$/;
    if (this.existingRole.roleName === '' || this.existingRole.roleName.trim()==="" || regex.exec(this.existingRole.roleName)===null) {
      this.updatedRoleNameErrorInfo = 'Role name is required';
      this.isUpdatedRoleNameValid = false;
    } else if (this.existingRole.roleName.length < 3) {
      this.updatedRoleNameErrorInfo = 'Role name should have min of 3 characters'
      this.isUpdatedRoleNameValid = false;
    } else if (this.existingRole.roleName.length > 50){
      this.updatedRoleNameErrorInfo = 'Role name should not exceed more than 50 characters'
      this.isUpdatedRoleNameValid = false;
    }else {
      this.updatedRoleNameErrorInfo = '';
      this.isUpdatedRoleNameValid = true;
    }
    return this.isUpdatedRoleNameValid;
  }

  validateUpdatePermissionValue(){
    if(this.existingRole.permission.permissionId.toString() === "0"){
      this.updatePermissionValueErrorInfo = 'Please choose a permission'
      this.isUpdatePermissionValueValid = false;
    }else{
      this.updatePermissionValueErrorInfo = '';
      this.isUpdatePermissionValueValid = true;
    }
    return this.isUpdatePermissionValueValid;
  }

  /**
   * create a new role
   */
  createRole() {
    let isNameValid = true;
    let isPermissionValid = true;
    //validate on submit
    if (this.isRoleNameValid === false) {
      var valid = this.validateRoleName();
      isNameValid = valid;
    }
    if(this.isPermissionValueValid === false){
      var valid = this.validatePermissionValue();
      isPermissionValid = valid;
    }
    //if no form errors submit the form
    if (isNameValid && isPermissionValid) {
      this.addRoleObj.roleName=this.addRoleObj.roleName.toUpperCase();
      this.addRoleObj.createdBy =this.transformToTitleCase(localStorage.getItem('firstName')+' '+localStorage.getItem('lastName')); 
      this.addRoleObj.createdByEmailId = localStorage.getItem('email');
      this.roleService.createRole(this.addRoleObj).subscribe({
        next: (response) => {
          if (response.status == HttpStatusCode.Created) {
            this.createdRole = response.body;
            this.toastr.success("Role created successfully !")
            //close form modal
            document.getElementById('closeAddModal').click();
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } 
        },error: error =>{
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }else if(error.status === HttpStatusCode.Found){
            this.toastr.error('Role name '+this.addRoleObj.roleName+' already exists')
            //close form modal
            //document.getElementById('closeAddModal').click();
          }else {
            this.toastr.error("Error while creating role. Please try again !")
          }
        }
      })
    }

  }

  /**
   * 
   */
  updateRole() {
    var isNameValid = true;
    var isPermissionValid = true;
    //validate on submit
    if (this.isUpdatedRoleNameValid === false) {
      var valid = this.validateUpdatedRoleName();
      isNameValid =valid;
    }
    if(this.isUpdatePermissionValueValid === false){
      var valid = this.validateUpdatePermissionValue();
      isPermissionValid = valid;
    }
      //if no errors in form, allow to submit
    if(isNameValid && isPermissionValid){
    this.existingRole.roleName=this.existingRole.roleName.toUpperCase();
    this.existingRole.modifiedBy =this.transformToTitleCase(localStorage.getItem('firstName')+' '+localStorage.getItem('lastName'));
    this.existingRole.modifiedByEmailId = localStorage.getItem('email');
    //this.updatedRole.modifiedDateTime = new Date(Date.now)
    this.roleService.updateRole(this.existingRole).subscribe({
     next: (response) => {
        if (response.status == HttpStatusCode.Created) {
          this.toastr.success("Role updated sucessfully !")
          //close form modal
          document.getElementById('closeUpdateModal').click();
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      },error: error =>{
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }else{
          this.toastr.error("Error occured while updating role. Please try again")
        }
      }
    })
    }
  }

  /**
   * 
   * @param id 
   */
  getRoleById(id: number) {
    this.roleService.getRole(id).subscribe({
     next: (response) => {
        this.existingRole = response.body;
      },error: error =>{
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      }
  })
  }


  /**
   * get all roles
   */
  roleDataLoaded:boolean=false;
  getRoleList() {
    this.isRoleDataText=true;
    this.isComponentLoading=true;
    setTimeout(()=>{
      this.isRoleDataText=false;
      this.isComponentLoading=false;
    },200)
    this.roleService.getAllRoles().subscribe({
      next: (response) => {
        if (response.status === HttpStatusCode.Ok) {
          this.roleList = response.body;
          this.roleDataLoaded=true;
            this.isRoleDataText=false;
            this.isComponentLoading=false;
        }
      },error: error =>{
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      }
  })
  }

  /**
   * 
   * @param id 
   */
  deleteRoleById(id: any) {
    var isConfirmed = window.confirm('Are you sure you want to delete this role ?');
    if (isConfirmed) {
      this.roleService.deleteSelectedRoles(id).subscribe({
        next: (response) => {
          if (response.status === HttpStatusCode.Ok) {
            this.toastr.success('Role ' + id + ' deleted successfully')
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        },error: error =>{
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }else if(error.status === HttpStatusCode.ImUsed){
            this.toastr.error('Role already in usage by an user, cannot be deleted');
          } else {
            this.toastr.error('Error while deleting role '+id+ '... Please try again !');
          }
        }
    })
    } else {
     // this.toastr.warning('Role '+id+' not deleted.');
    }
  }

  /**
   * 
   * @param mainCheckBox check subcheckbox if main checkbox is checked
   */
  checkSubCheckBoxes(mainCheckBox: any){
      if($('#mainCheckBox').is(':checked')){
        $('.subCheckBox').prop('checked', true);
      }else{
        $('.subCheckBox').prop('checked', false);
      }
   }

  /**
   * remove multiple roles
   */
  roleIdsToBeDeleted = [];
  removeAllSelectedRoles(){
    //initialize to empty array on click from second time
    this.roleIdsToBeDeleted = [];
   var subCheckBoxes = document.getElementsByClassName('subCheckBox') as HTMLCollectionOf<HTMLInputElement>;
   for(var i=0; i<subCheckBoxes.length; i++){
    if(subCheckBoxes[i].checked){
      this.roleIdsToBeDeleted.push(subCheckBoxes[i].value);
    }
   }
   //delete the selected roles
   if(this.roleIdsToBeDeleted.length>0){
    //confirm before deleting
    var isconfirmed = window.confirm('Are you sure, you really want to delete these roles ?')
    if(isconfirmed){
      this.roleService.deleteSelectedRoles(this.roleIdsToBeDeleted).subscribe({
        next: (response) => {
          if(response.status === HttpStatusCode.Ok){
            var isAllDeleted = response.body    
            if(this.roleIdsToBeDeleted.length > 1){
              this.toastr.success('Roles deleted sucessfully.')  
            }else{
              this.toastr.success('Role '+this.roleIdsToBeDeleted+' is deleted')
            }
            setTimeout(()=>{
              window.location.reload();
            },1000)  
          }else{
            this.toastr.error('Error while deleting roles... Please try again !');
          }
        },error: error =>{
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }else if(error.status === HttpStatusCode.ImUsed){
            this.toastr.error('Role already in usage by an user, cannot be deleted');
          }
        }
      })
    }else{
      //this.toastr.warning('Roles not deleted')
    }
   }else{
    this.toastr.error('Please select atleast one role to delete')
   }
  }

  /**
   * 
   */
  clearErrorMessages(){
    //clear create form
    this.addRoleObj.roleName = '';
    this.addRoleObj.permission.permissionId = 0;

    //clear create form error messages
    this.roleNameErrorInfo= '';
    this.permissionValueErrorInfo = '';

    //clear update form error messages
    this.updatedRoleNameErrorInfo = '';

    this.isRoleNameValid=false;
    this.isPermissionValueValid = false;
  }

  /**
   * 
   * @param index Uncheck the main checkbox when any of its child/subcheckbox is checked
   */
  toggleMainCheckBox(index: number){
    if(!$('#subCheckBox'+index).is(':checked')){
      $('#mainCheckBox').prop('checked',false);
      //$('#mainCheckBox').css
    }
    const anyUnchecked = $('.subCheckBox:not(:checked)').length > 0;
    $('#mainCheckBox').prop('checked', !anyUnchecked);
  }

  transformToTitleCase(text: string): string {
    return text.toLowerCase().split(' ').map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  currentMenuItem: MenuItem;
  async getCurrentMenuItemDetails() : Promise<MenuItem> {
      const response =  await lastValueFrom(this.menuItemService.findMenuItemByName('Roles')).then(response => {
        if (response.status === HttpStatusCode.Ok) {
          this.currentMenuItem = response.body;
        }else if(response.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      },reason => {
        if(reason.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }
      }
      )
    return this.currentMenuItem;
  }
}

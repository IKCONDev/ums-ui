
import { Component, AfterViewInit, OnDestroy, OnInit, Output } from '@angular/core';
import * as $ from 'jquery';
import 'datatables.net';
import { RoleService } from './service/role.service';
import { Role } from '../model/Role.model';
import { ToastrService } from 'ngx-toastr';
import { HttpStatusCode } from '@angular/common/http';
import { error } from 'jquery';
import { Router } from '@angular/router';


@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})

export class RoleComponent implements OnInit,AfterViewInit,OnDestroy {

  private table: any;

  ngAfterViewInit(): void {
    $(document).ready(() => {
      this.table = $('#dataTable').DataTable({
        paging: true,
        searching: true, // Enable search feature
        pageLength: 7,
        // Add other options here as needed
      });
    });
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
    }
  }

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
    modifiedDateTime: Date
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
  }

  /**
   * 
   * @param roleService 
   * @param toastr 
   */
  constructor(private roleService: RoleService, private toastr: ToastrService,
    private router: Router) {

  }

  ngOnInit(): void {
    this.getRoleList();
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
    } else if (this.addRoleObj.roleName.length < 3) {
      this.roleNameErrorInfo = 'Role name should have min of 3 chars'
    }else if (this.addRoleObj.roleName.length>=50){
      this.roleNameErrorInfo = 'Role name should not exceed more than 50 chars'
    }
     else {
      this.roleNameErrorInfo = '';
      this.isRoleNameValid = true;
    }
    return this.isRoleNameValid;
  }

  updatedRoleNameErrorInfo: string = ''
  isUpdatedRoleNameValid = false;
  /**
   * 
   * @returns 
   */
  validateUpdatedRoleName() {
    const regex = /^\S.*[a-zA-Z\s]*$/;
    if (this.existingRole.roleName === '' || this.existingRole.roleName.trim()==="" || regex.exec(this.existingRole.roleName)===null) {
      this.updatedRoleNameErrorInfo = 'Role name is required';
    } else if (this.existingRole.roleName.length < 3) {
      this.updatedRoleNameErrorInfo = 'Role name should have min of 3 chars'
    } else if (this.existingRole.roleName.length>=50){
      this.updatedRoleNameErrorInfo = 'Role name should not exceed more than 50 chars'
    }else {
      this.updatedRoleNameErrorInfo = '';
      this.isUpdatedRoleNameValid = true;
    }
    return this.isUpdatedRoleNameValid;
  }

  /**
   * create a new role
   */
  createRole() {
    console.log('executed')
    let isNameValid = true;
    //validate on submit
    if (this.isRoleNameValid === false) {
      var valid = this.validateRoleName();
      isNameValid = valid;
    }
    console.log(isNameValid)
    //if no form errors submit the form
    if (isNameValid) {
      this.addRoleObj.createdBy = localStorage.getItem('firstName')+' '+localStorage.getItem('lastName');
      this.addRoleObj.createdByEmailId = localStorage.getItem('email');
      console.log(this.addRoleObj)
      this.roleService.createRole(this.addRoleObj).subscribe({
        next: (response) => {
          if (response.status == HttpStatusCode.Created) {
            this.createdRole = response.body;
            this.toastr.success("Role created sucessfully !")
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
            document.getElementById('closeAddModal').click();
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
    //validate on submit
    if (this.isUpdatedRoleNameValid === false) {
      var valid = this.validateUpdatedRoleName();
      console.log(valid)
      isNameValid =valid;
    }
      //if no errors in form, allow to submit
    if(isNameValid){
      this.existingRole.modifiedBy = localStorage.getItem('firstName')+' '+localStorage.getItem('lastName');
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
        } else {
          this.toastr.error("Role not updated. Please try again.")
        }
      },error: error =>{
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
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
        // this.existingRole = response.body;
        // this.existingRole.roleId = this.existingRole.roleId;
        // this.existingRole.roleName = this.existingRole.roleName;
        // this.existingRole.createdBy = this.existingRole.createdBy;
        // this.existingRole.createdByEmailId = this.existingRole.createdByEmailId;
        // this.existingRole.createdDateTime = this.existingRole.createdDateTime.toString();
        // this.existingRole.modifiedBy = this.existingRole.modifiedBy;
        // this.existingRole.modifiedByEmailId = this.existingRole.modifiedByEmailId;
        // this.existingRole.modifiedDateTime = new Date(this.existingRole.modifiedDateTime).toISOString();
        this.existingRole = response.body;
        console.log(this.existingRole);
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
  getRoleList() {
    this.roleService.getAllRoles().subscribe({
      next: (response) => {
        if (response.status === HttpStatusCode.Ok) {
          this.roleList = response.body;
          console.log(response.body)
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
          } else {
            this.toastr.error('Error while deleting role '+id+ '... Please try again !');
          }
        },error: error =>{
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }
        }
    })
    } else {
      this.toastr.warning('Role '+id+' not deleted.');
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
      console.log(this.roleIdsToBeDeleted);
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
            this.toastr.success('Roles deleted sucessfully')  
            setTimeout(()=>{
              window.location.reload();
            },1000)  
          }else{
            this.toastr.error('Error while deleting roles... Please try again !');
          }
        },error: error =>{
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }
        }
      })
    }else{
      this.toastr.warning('Roles not deleted')
    }
   }else{
    this.toastr.error('Please select atleast one role to delete.')
   }
  }

  /**
   * 
   */
  clearErrorMessages(){
    //clear create form
    this.addRoleObj.roleName = '';

    //clear create form error messages
    this.roleNameErrorInfo= '';

    //clear update form error messages
    this.updatedRoleNameErrorInfo = '';
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
  }


}

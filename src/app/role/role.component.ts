import { Component, OnInit, Output } from '@angular/core';
import { RoleService } from './service/role.service';
import { Role } from '../model/Role.model';
import { ToastrService } from 'ngx-toastr';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {

  @Output() title: string = 'Roles';
  createdRole: Role
  roleList: Role[];

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

  // addRoleObj: Role;

  constructor(private roleService: RoleService, private toastr: ToastrService) {

  }

  ngOnInit(): void {
    this.getRoleList();
  }

  roleNameErrorInfo: string = ''
  isRoleNameValid: boolean = false;
  validateRoleName() {
    if (this.addRoleObj.roleName === '') {
      this.roleNameErrorInfo = 'role name is required';
    } else if (this.addRoleObj.roleName.length < 2) {
      this.roleNameErrorInfo = 'role name should have min of 2 chars'
    } else {
      this.roleNameErrorInfo = '';
      this.isRoleNameValid = true;
    }
    return this.isRoleNameValid;
  }

  updatedRoleNameErrorInfo: string = ''
  isUpdatedRoleNameValid = false;
  validateUpdatedRoleName() {
    if (this.existingRole.roleName === '') {
      this.updatedRoleNameErrorInfo = 'role name is required';
    } else if (this.existingRole.roleName.length < 2) {
      this.updatedRoleNameErrorInfo = 'role name should have min of 2 chars'
    } else {
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
      this.addRoleObj.createdBy = localStorage.getItem('firstName');
      this.addRoleObj.createdByEmailId = localStorage.getItem('email');
      console.log(this.addRoleObj)
      this.roleService.createRole(this.addRoleObj).subscribe(
        (response => {
          if (response.status == HttpStatusCode.Created) {
            this.createdRole = response.body;
            this.toastr.success("Role Created Sucessfully !")
            //close form modal
            document.getElementById('closeAddModal').click();
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            this.toastr.error("Role not created. Please try again.")
          }
        })
      )
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
      this.existingRole.modifiedBy = localStorage.getItem('firstName');
    this.existingRole.modifiedByEmailId = localStorage.getItem('email');
    //this.updatedRole.modifiedDateTime = new Date(Date.now)
    this.roleService.updateRole(this.existingRole).subscribe(
      (response => {
        if (response.status == HttpStatusCode.Created) {
          this.toastr.success("Role Updated Sucessfully !")
          //close form modal
          document.getElementById('closeUpdateModal').click();
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          this.toastr.error("Role not updated. Please try again.")
        }
      })
    )
    }
  }

  /**
   * 
   * @param id 
   */
  getRoleById(id: number) {
    this.roleService.getRole(id).subscribe(
      (response => {
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
      })
    )
  }


  /**
   * get all roles
   */
  getRoleList() {
    this.roleService.getAllRoles().subscribe(
      (response => {
        if (response.status === HttpStatusCode.Ok) {
          this.roleList = response.body;
          console.log(response.body)
        }
      })
    )
  }

  deleteRoleById(id: number) {
    var isConfirmed = window.confirm('Are you sure you want to delete this record ?');
    if (isConfirmed) {
      this.roleService.deleteRole(id).subscribe(
        (response => {
          if (response.status === HttpStatusCode.Ok) {
            this.toastr.success('Role ' + id + ' deleted successfully')
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            this.toastr.error("Role '+id+' could not be deleted.. Please try again !");
          }
        })
      )
    } else {
      this.toastr.warning('Role deletion cancelled');
    }
  }

  clearErrorMessages(){
    //clear create form
    this.addRoleObj.roleName = '';

    //clear create form error messages
    this.roleNameErrorInfo= '';

    //clear update form error messages
    this.updatedRoleNameErrorInfo = '';
  }


}

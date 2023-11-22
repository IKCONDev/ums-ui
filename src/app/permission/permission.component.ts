import { Component, OnInit,Output } from '@angular/core';
import { PermissionService } from './service/permission.service';
import { Permission } from '../model/Permission.model';
import { HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.css']
})
export class PermissionComponent implements OnInit{
  @Output() title = 'Permissions';
  private table: any;
  addPermission: Permission = new Permission();
  loggedInUser = localStorage.getItem('email');
  loggedInUserRole = localStorage.getItem('userRole')
  loggedInUserFullName = localStorage.getItem('firstName')+' '+localStorage.getItem('lastName');
  ngOnInit(): void {
    this.getAllPermissions();
    throw new Error('Method not implemented.');
  }
  
  constructor (private permissionService :PermissionService, private router:Router, private toastrService:ToastrService){

  }
  permissionsList :Permission[];
  getAllPermissions(){
    this.permissionService.getAllPermissions().subscribe({
      next: response => {
        this.permissionsList = response.body;
        console.log(response.body)
      }
    })
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      $(document).ready(() => {
        this.table = $('#table').DataTable({
          paging: true,
          searching: true, // Enable search feature
          pageLength: 7,
          order: [[1,'asc']]
          // Add other options here as needed
        });
      });
    },200)
  }

  createOrUpdateTaskCategory(){
    if(this.addPermission.permissionId === 0){
      this.createPermission(this.addPermission);
    }
    else{
      this.updatePermission(this.addPermission)
    }
  }

  createPermission(permission:Permission){
    console.log(permission.permissionId)
      permission.createdByEmailId = this.loggedInUser;
      permission.createdBy = this.loggedInUserFullName;
      this.permissionService.createPermission(permission).subscribe({
        next: response => {
          if(response.status === HttpStatusCode.Created){
            this.toastrService.success('permission created successfully');
            setTimeout(() => {
              window.location.reload();
            },1000)
          }
        },error: error => {
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }
          else {
            this.toastrService.error('Error while creating the task category. Please try again !')
          }
        }
      })
    }
    updatePermission(permission: Permission){
        permission.modifiedByEmailId = this.loggedInUser;
        permission.modifiedBy = this.loggedInUserFullName;
        this.permissionService.updatePermission(permission).subscribe({
          next: response => {
            if(response.status === HttpStatusCode.PartialContent){
              this.toastrService.success('Permission updated successfully');
              setTimeout(() => {
                window.location.reload();
              },1000)
            }
          },error: error => {
            if(error.status === HttpStatusCode.Unauthorized){
              this.router.navigateByUrl('/session-timeout');
            }else {
              this.toastrService.error('Error while creating the permission, Please try again !')
            }
          }
        })
    }
    
    getpermissonById(permissionId: number){
      this.permissionService.findPermissionById(permissionId).subscribe({
        next: response => {
          if(response.status === HttpStatusCode.Ok){
            this.addPermission = response.body;
          }
        }
      })
    }
 
    permissionDescriptionErrorInfo:string =''
    isPermissionDescriptionValid:boolean = false;
    validateTaskCategoryDescription(){
      const regex = /^\S.*[a-zA-Z\s]*$/;
      if(this.addPermission.permissionDescription === '' || this.addPermission.permissionDescription.trim()==="" || 
      regex.exec(this.addPermission.permissionDescription)===null){
        this.permissionDescriptionErrorInfo = 'Task category description is required';
        this.isPermissionDescriptionValid = false;
      }else if(this.addPermission.permissionDescription.length < 5){
        this.permissionDescriptionErrorInfo = 'Task category description should have minimum of 5 characters.';
        this.isPermissionDescriptionValid = false;
      }else if(this.addPermission.permissionDescription.length > 50){
        this.permissionDescriptionErrorInfo = 'Task category description should not exceed more than 100 characters';
        this.isPermissionDescriptionValid = false;
      }else{
        this.isPermissionDescriptionValid = true;
        this.permissionDescriptionErrorInfo = '';
      }
      return this.isPermissionDescriptionValid;
    }
     
}


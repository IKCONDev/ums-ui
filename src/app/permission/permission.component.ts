import { AfterViewChecked, Component, OnInit,Output } from '@angular/core';
import { PermissionService } from './service/permission.service';
import { Permission } from '../model/Permission.model';
import { HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';
import { MenuItem } from '../model/MenuItem.model';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.css']
})
export class PermissionComponent implements OnInit,AfterViewChecked{
  @Output() title = 'Permissions';
  private table: any;
  addPermission: Permission = new Permission();
  loggedInUser = localStorage.getItem('email');
  loggedInUserRole = localStorage.getItem('userRole')
  loggedInUserFullName =this.transformToTitleCase(localStorage.getItem('firstName')+' '+localStorage.getItem('lastName'));
  isPermissionDataText:boolean=false;
  isComponentLoading:boolean=false;
  permissionsList :Permission[];

  viewPermission: boolean;
  createPermission: boolean;
  updatePermission: boolean;
  deletePermission: boolean;
  noPermissions: boolean;
  addButtonColor: string;
  deleteButtonColor: string;
  updateButtonColor: string;
  userRoleMenuItemsPermissionMap: Map<string, string>

  async ngOnInit(): Promise<void> {
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
          this.getAllPermissions();
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
  
  constructor (private permissionService :PermissionService, private router:Router, private toastrService:ToastrService,
    private menuItemService: AppMenuItemService){

  }
  permissionDataLoaded:boolean=false;
  getAllPermissions(){
    this.isComponentLoading=true;
    this.isPermissionDataText=true;
    setTimeout(()=>{
      this.isComponentLoading=false;
      this.isPermissionDataText=false;
    },200)
    this.permissionService.getAllPermissions().subscribe({
      next: response => {
        this.permissionsList = response.body;
        this.permissionDataLoaded=true;
          this.isComponentLoading=false;
          this.isPermissionDataText=false;
      }
    })
  }

  initializedataTable:boolean=false;
  ngAfterViewChecked(): void {
    this.initializeJqueryTable();
  }

  initializeJqueryTable(){
    if(this.permissionDataLoaded&&!this.initializedataTable){
    this.table = $('#table').DataTable({
      paging: true,
      searching: true, // Enable search feature
      pageLength: 10,
      stateSave:true,
      order: [[0,'asc']],
      lengthMenu: [ [10, 25, 50, -1], [10, 25, 50, "All"] ],
      columnDefs:[{
        "targets": [4,5],
        "orderable":false
      }]
      // Add other options here as needed
    });
    this.initializedataTable=true;
  }
           
  }

  createOrUpdateTaskCategory(){
    if(this.addPermission.permissionId === 0){
      this.createPermissionObject(this.addPermission);
    }
    else{
      this.updatePermissionObject(this.addPermission)
    }
  }

  createPermissionObject(permission:Permission){
    let isPermissionValueValid = true;
    let isPermissionDescriptionValid = true;
    if(!this.isPermissionValueValid){
      var valid = this.validatePermissionValue();
      isPermissionValueValid = valid;
    }
    if(!this.isPermissionDescriptionValid){
      var valid = this.validatePermissionDescription();
      isPermissionDescriptionValid = valid;

    }
    if(isPermissionValueValid === true && isPermissionDescriptionValid === true){

      permission.createdByEmailId = this.loggedInUser;
      permission.createdBy = this.loggedInUserFullName;
      this.permissionService.createPermission(permission).subscribe({
        next: response => {
          if(response.status === HttpStatusCode.Created){
            this.closeModal();
            this.toastrService.success('Permission created successfully.');
            setTimeout(() => {
              window.location.reload();
            },1000)
          }
        },error: error => {
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }
          else {
            this.toastrService.error('Error occured while creating permission. Please try again !')
          }
        }
      })

    }
      
    }
    updatePermissionObject(permission: Permission){

      let isPermissionValueValid = true;
      let isPermissionDescriptionValid = true;
      if(!this.isPermissionValueValid){
        var valid = this.validatePermissionValue();
        isPermissionValueValid = valid;
      }
      if(!this.isPermissionDescriptionValid){
        var valid = this.validatePermissionDescription();
        isPermissionDescriptionValid = valid;
  
      }
      if(isPermissionValueValid === true && isPermissionDescriptionValid === true){

        permission.modifiedByEmailId = this.loggedInUser;
        permission.modifiedBy = this.loggedInUserFullName;
        this.permissionService.updatePermission(permission).subscribe({
          next: response => {
            if(response.status === HttpStatusCode.PartialContent){
              this.closeModal();
              this.toastrService.success('Permission '+ permission.permissionId+' updated successfully.');
              setTimeout(() => {
                window.location.reload();
              },1000)
            }
          },error: error => {
            if(error.status === HttpStatusCode.Unauthorized){
              this.router.navigateByUrl('/session-timeout');
            }else {
              this.toastrService.error("Error occured while updating the permission "+ permission.permissionId+". Please try again !")
            }
          }
        })


      }   
    }
    closeModal(){
      document.getElementById('closeModal').click();
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

    permissionValueErrorInfo:string =''
    isPermissionValueValid:boolean = false;
    validatePermissionValue(){
      const regex = /^\S.*[a-zA-Z\s]*$/;
      const regex2=/^[A-Za-z ,]+$/;
      if(this.addPermission.permissionValue =='' || this.addPermission.permissionValue.trim()==="" || regex.exec(this.addPermission.permissionValue)===null){
        this.permissionValueErrorInfo = 'Permission Value is required.';
        this.isPermissionValueValid = false;
      }else if(regex2.test(this.addPermission.permissionValue) === false){
        this.permissionValueErrorInfo = 'Permission value cannot have special characters or numbers.';
        this.isPermissionValueValid = false;
      }else if(this.addPermission.permissionValue.length < 3){
        this.permissionValueErrorInfo = 'Permission value should have minimum of 3 characters.';
        this.isPermissionValueValid = false;
      }else if(this.addPermission.permissionValue.length > 50){
        this.permissionValueErrorInfo = 'Permission value should not exceed more than 50 characters.';
        this.isPermissionValueValid = false;
      }
      else{
        this.isPermissionValueValid = true;
        this.permissionValueErrorInfo = '';
      }
      return this.isPermissionValueValid;
    }
 
    permissionDescriptionErrorInfo:string =''
    isPermissionDescriptionValid:boolean = false;
    validatePermissionDescription(){
      const regex = /^\S.*[a-zA-Z\s]*$/;
      if(this.addPermission.permissionDescription === '' || this.addPermission.permissionDescription.trim()==="" || 
      regex.exec(this.addPermission.permissionDescription)===null){
        this.permissionDescriptionErrorInfo = 'Permission description is required.';
        this.isPermissionDescriptionValid = false;
      }else if(this.addPermission.permissionDescription.length < 5){
        this.permissionDescriptionErrorInfo = 'Permission description should have minimum of 5 characters.';
        this.isPermissionDescriptionValid = false;
      }else if(this.addPermission.permissionDescription.length > 100){
        this.permissionDescriptionErrorInfo = 'Permission description should not exceed more than 100 characters.';
        this.isPermissionDescriptionValid = false;
      }else{
        this.isPermissionDescriptionValid = true;
        this.permissionDescriptionErrorInfo = '';
      }
      return this.isPermissionDescriptionValid;
    }

    
  clearErrorMessages(){
    this.addPermission.permissionDescription = '';
    this.addPermission.permissionValue= '';

    this.isPermissionValueValid = false;
    this.isPermissionDescriptionValid = false;

    this.permissionDescriptionErrorInfo = '';
    this.permissionValueErrorInfo = '';
    
  }
  removePermission(permissionId : number){
    var isconfirmed = window.confirm("Are you sure, you really want to delete selected permission ?")
    if(isconfirmed){
       this.permissionService.deleteSelectedPermission(permissionId).subscribe({
         next: response =>{
            if(response.status == HttpStatusCode.Ok){
               this.toastrService.success("Permission "+ permissionId+" deleted successfully.");
               setTimeout(() => {
                window.location.reload();
              },1000)
               
            }
         },error: error => {
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }else if(error.status === HttpStatusCode.ImUsed){
            this.toastrService.error("Permission is already in usage by a 'Role' Cannot be deleted.");
          }
          else {
            this.toastrService.error('Error occured while deleting '+ permissionId+' permission. Please try again !')
          }
        }

       })

    }
    else{
      // this.toastrService.warning('Permission '+ permissionId +' not deleted.')
    }
  }   

  transformToTitleCase(text: string): string {
    return text.toLowerCase().split(' ').map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  currentMenuItem: MenuItem;
  async getCurrentMenuItemDetails() : Promise<MenuItem> {
      const response =  await lastValueFrom(this.menuItemService.findMenuItemByName('Permissions')).then(response => {
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


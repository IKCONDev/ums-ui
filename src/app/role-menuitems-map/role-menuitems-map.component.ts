import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { RoleService } from '../role/service/role.service';
import { HttpStatusCode } from '@angular/common/http';
import { Role } from '../model/Role.model';
import { Router } from '@angular/router';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';
import { error } from 'jquery';
import { MenuItem } from '../model/MenuItem.model';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-role-menuitems-map',
  templateUrl: './role-menuitems-map.component.html',
  styleUrls: ['./role-menuitems-map.component.css']
})
export class RoleMenuitemsMapComponent implements OnInit, AfterViewChecked {

  private table: any;
  @Output() title = 'Role Menu Items'
  roleList: Role[];
  isRoleDataText: boolean = false;
  isComponentLoading: boolean = false;
  existingRole: Role = new Role();
  menuItemList: MenuItem[];
  menuItems: MenuItem[] = [];
  selectedMenuItemIds:any[] = [];
  @ViewChildren("checkboxes") menuItemCheckboxes: QueryList<ElementRef>;
  viewPermission: boolean;
  createPermission: boolean;
  updatePermission: boolean;
  deletePermission: boolean;
  noPermissions: boolean;
  addButtonColor: string;
  deleteButtonColor: string;
  updateButtonColor: string;
  userRoleMenuItemsPermissionMap: Map<string, string>

  constructor(private roleService: RoleService,
    private router: Router,
    private menuItemService: AppMenuItemService,
    private toastr: ToastrService){
  }

  initializeDataTable:boolean=false;
  ngAfterViewChecked(): void {
    this.initializeJqueryTable();

  }
  initializeJqueryTable(){
    if(this.roleMenuItemsDataLoaded&&!this.initializeDataTable){
        this.table = $('#dataTable').DataTable({
          paging: true,
          stateSave:true,
          searching: true, // Enable search feature
          pageLength: 10,
          order: [[0,'asc']],
          lengthMenu: [ [10, 25, 50, -1], [10, 25, 50, "All"] ],
          columnDefs:[{
            "targets": 8,
            "orderable":false
          }]
          // Add other options here as needed
        });
        this.initializeDataTable=true;
      }
  }

  async ngOnInit(): Promise<void> {
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
          this.getAllMenuItems();
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
          this.updateButtonColor = 'black';
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

  /**
   * get all roles
   */
  roleMenuItemsDataLoaded:boolean=false;
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
          this.roleMenuItemsDataLoaded=true
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
   getRoleById(id: number) {
    this.roleService.getRole(id).subscribe({
     next: (response) => {
        this.existingRole = response.body;
        if(this.existingRole.menuItems.length > 0){
          this.existingRole.menuItems.forEach(item => {
            //set existing menu item checkboxes to checked/true
            this.menuItemCheckboxes.forEach((element) => {
                 var value = element.nativeElement.value;
                 if(value.toString().trim() === item.menuItemId.toString().trim()){
                //set existing menu items to the new menu items array
                 this.menuItems.push(item);
                 element.nativeElement.checked = true;
                 }
            }); 
          })
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
   */
  getAllMenuItems(){
    this.menuItemService.findMenuItems().subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.menuItemList = response.body;
        }
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      }
    })
  }

  /**
   * 
   * @param event 
   * @param index 
   */
  storeSelectedMenuItems(event: any, index: number){
    //if a menu item is checked store the menu item in menuItems array.
    if(event.target.checked === true){
      this.selectedMenuItemIds.push(event.target.value);
      this.menuItemList.forEach(menuItem => {
        if(menuItem.menuItemId === parseInt(event.target.value)){
          this.menuItems.push(menuItem);
        }
      })
    }else{
      //if a menu item is unchecked, remove the menu item from the menuItems array.
      var unCheckedMenuID = this.selectedMenuItemIds.pop();
      var i = 0;
      this.menuItems.forEach(menuItem => {
        if(menuItem.menuItemId === parseInt(event.target.value)){
          this.menuItems.splice(i,1);
        }
        i=i+1;
      })
    }
    this.existingRole.menuItems = this.menuItems;
  }

  /**
   * 
   */
  updateRoleWithMenuItems(){
    this.roleService.updateRole(this.existingRole).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Created){
          var updatedRole = response.body;
          document.getElementById('closeUpdateModal').click();
          this.toastr.success("Menu Items for the role '"+this.existingRole.roleName+"' assigned successfully.")
          setTimeout(() => {
            window.location.reload();
          },1000)
        }
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }else{
          this.toastr.error('Error occured while assigning menu items for the role. Please try again !');
        }
      }
    })
  }

  clearErrorMessages(){
    //uncheck all the checkbox on modal close
    this.menuItemCheckboxes.forEach(element => {
      element.nativeElement.checked = false;
    })
    //empty the menu items list for a new role for next time
    this.menuItems = [];
  }

  currentMenuItem: MenuItem;
  async getCurrentMenuItemDetails() : Promise<MenuItem> {
      const response =  await lastValueFrom(this.menuItemService.findMenuItemByName('Role Menu Items')).then(response => {
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

  selectAllMenuItemCheckBoxes(){
    console.log(true)
    $('.menuItems').prop('checked', true);  
  }


}

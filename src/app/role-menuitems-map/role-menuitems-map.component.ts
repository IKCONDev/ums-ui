import { AfterViewInit, Component, ElementRef, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { RoleService } from '../role/service/role.service';
import { HttpStatusCode } from '@angular/common/http';
import { Role } from '../model/Role.model';
import { Router } from '@angular/router';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';
import { error } from 'jquery';
import { MenuItem } from '../model/MenuItem.model';

@Component({
  selector: 'app-role-menuitems-map',
  templateUrl: './role-menuitems-map.component.html',
  styleUrls: ['./role-menuitems-map.component.css']
})
export class RoleMenuitemsMapComponent implements OnInit, AfterViewInit {

  private table: any;
  @Output() title = 'Role Menu Items'
  roleList: Role[];
  isRoleDataText: boolean = false;
  isComponentLoading: boolean = false;
  existingRole: Role = new Role();
  menuItemList: MenuItem[];
  menuItemIds: number[] = [];

  constructor(private roleService: RoleService,
    private router: Router,
    private menuItemService: AppMenuItemService){
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      $(document).ready(() => {
        this.table = $('#dataTable').DataTable({
          paging: true,
          searching: true, // Enable search feature
          pageLength: 7,
          order: [[1,'asc']],
          lengthMenu: [ [7, 10, 25, 50, -1], [7, 10, 25, 50, "All"] ]
          // Add other options here as needed
        });
      });
    },400)
  }

  ngOnInit(): void {
    this.getRoleList();
    this.getAllMenuItems();
  }

  /**
   * get all roles
   */
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
            this.isRoleDataText=false;
            this.isComponentLoading=false;
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
   menuItems: MenuItem[] = [];
   selectedMenuItemIds:any[] = [];
   @ViewChildren("checkboxes") checkboxes: QueryList<ElementRef>;
   getRoleById(id: number) {
    console.log(this.checkboxes)
    this.roleService.getRole(id).subscribe({
     next: (response) => {
        this.existingRole = response.body;
        console.log(this.existingRole.menuItems)
        if(this.existingRole.menuItems.length > 0){
          this.existingRole.menuItems.forEach(item => {
            //set existing menu item checkboxes to checked/true
            this.checkboxes.forEach((element) => {
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
   */
  storeValue(event: any, index: number){
    console.log(event.target.value)
    //if a menu item is checked store the menu item in menuItems array.
    if(event.target.checked === true){
      this.selectedMenuItemIds.push(event.target.value);
      console.log(this.selectedMenuItemIds)
      this.menuItemList.forEach(menuItem => {
        if(menuItem.menuItemId === parseInt(event.target.value)){
          this.menuItems.push(menuItem);
        }
      })
      console.log(this.menuItems)
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
      console.log(this.menuItems);
    }
    this.existingRole.menuItems = this.menuItems;
    console.log(this.existingRole.menuItems);
  }

  updateRoleWithMenuItems(){
   console.log(this.existingRole)
    this.roleService.updateRole(this.existingRole).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.PartialContent){
          var updatedRole = response.body;
          setTimeout(() => {
            window.location.reload();
          },1000)
        }
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      }
    })
  }


}

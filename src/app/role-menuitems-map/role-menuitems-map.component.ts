import { AfterViewInit, Component, OnInit, Output } from '@angular/core';
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
   getRoleById(id: number) {
    this.roleService.getRole(id).subscribe({
     next: (response) => {
        this.existingRole = response.body;
        console.log(this.existingRole)
        // this.menuItemList.forEach(menuItem => {
        //   this.existingRole.menuItems.forEach(extMenuItem => {
        //     if(menuItem.menuItemId === extMenuItem.menuItemId){
        //       this.menuItemIds.push[extMenuIte]
        //     }
        //   })
        // })
        this.existingRole.menuItems.forEach(menuItem => {
          this.menuItemIds.push(menuItem.menuItemId)
        })
        console.log(this.menuItemIds)
        console.log(this.existingRole);
        var menuItemsDropdown = document.getElementById('menuItemsBox') as HTMLSelectElement;
        if(this.existingRole.menuItems.length > 0){
          this.existingRole.menuItems.forEach(menuItem => {
            console.log(menuItem)
            for(var j=0;  j < menuItemsDropdown.options.length;  j++){
              if(menuItemsDropdown.options[j].value.trim() === menuItem.menuItemId.toString()){
                console.log('exe')
                menuItemsDropdown.options[j].selected = true;
                //menuItemsDropdown.options[j].style.background = 'lightgrey';
                menuItemsDropdown.options[j].style.marginBottom = '3px'
                break;
              }
           }
          })
        }else{
          for(var j=0;  j < menuItemsDropdown.options.length;  j++){
            menuItemsDropdown.options[j].selected = false;
           // menuItemsDropdown.options[j].style.background = 'white';
            menuItemsDropdown.options[j].style.marginBottom = '0px'
          }
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
  menuItems: MenuItem[] = [];
  updateRoleWithMenuItems(){
    console.log(this.existingRole)
    // var newMenuItems = [];
    //   this.existingRole.menuItems.forEach(extMenuItem => {
    //     this.menuItemIds.forEach(id => {
    //       if(extMenuItem.menuItemId != id){
    //         newMenuItems.push(id);
    //         return;
    //       }
    //     })
    //   })
    //   this.menuItemList.forEach(menuItem => {
    //     newMenuItems.forEach(menuItemId => {
    //       if(menuItem.menuItemId === menuItemId){
    //         this.existingRole.menuItems.push(menuItem);
    //       }
    //     })
    //   })
    var newMenuItems = [];
    var multiselect = document.getElementById("menuItemsBox") as HTMLSelectElement;
    var selectedOptions = [];
    for (var i = 0; i < multiselect.options.length; i++) {
    if (multiselect.options[i].selected) {
      selectedOptions.push(multiselect.options[i].value);
    }
   }
   this.menuItemList.forEach(menuItem => {
    console.log(menuItem.menuItemId)
    for(var i=0; i<selectedOptions.length;i++){
      console.log(selectedOptions[i])
      if(selectedOptions[i].toString().trim() == menuItem.menuItemId.toString().trim()){
        console.log('exe')
        newMenuItems.push(menuItem);
        return;
      }
    }
   })
   this.existingRole.menuItems = newMenuItems;
   console.log(newMenuItems)
   console.log(this.existingRole)
    this.roleService.updateRole(this.existingRole).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.PartialContent){
          var updatedRole = response.body;
        }
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      }
    })
  }


}

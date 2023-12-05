import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from '../model/MenuItem.model';
import { lastValueFrom } from 'rxjs';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  title: string = 'Settings';
  loggedInUserRole = localStorage.getItem('userRole');


  /**
   * 
   */
  constructor(private router: Router, private menuItemService: AppMenuItemService){
    
  }

  /**
   * 
   */
  userRoleMenuItemsPermissionMap: Map<string, string>;
  viewPermission: boolean;
  createPermission: boolean;
  updatePermission: boolean;
  deletePermission: boolean;
  noPermissions: boolean;

  async ngOnInit(): Promise<void> {
    if(this.loggedInUserRole != 'ADMIN' && this.loggedInUserRole != 'SUPER_ADMIN'){
      this.router.navigateByUrl('/unauthorized');
    }
    if(localStorage.getItem('jwtToken') === null){
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
        }else{
          this.viewPermission = false;
        }
        if (menuItemPermissions.includes('Create')) {
          this.createPermission = true;
        }else{
          this.createPermission = false;
        }
        if (menuItemPermissions.includes('Update')) {
          this.updatePermission = true;
        }else{
          this.updatePermission = false;
        }
        if (menuItemPermissions.includes('Delete')) {
          this.deletePermission = true;
        }else{
          this.deletePermission = false;
        }
      }else{
        this.noPermissions = true;
      }
  }

  currentMenuItem: MenuItem;
  async getCurrentMenuItemDetails() : Promise<MenuItem> {
      const response =  await lastValueFrom(this.menuItemService.findMenuItemByName('Settings')).then(response => {
        if (response.status === HttpStatusCode.Ok) {
          this.currentMenuItem = response.body;
          console.log(this.currentMenuItem)
        }else if(response.status === HttpStatusCode.Unauthorized){
          console.log('eit')
          this.router.navigateByUrl('/session-timeout');
        }
      },reason => {
        if(reason.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }
      }
      )
    console.log(this.currentMenuItem);
    return this.currentMenuItem;
  }

}

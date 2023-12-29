
import { AfterViewInit, Component, OnDestroy, Output } from '@angular/core';
import { OnInit } from '@angular/core';
import { BatchDetails } from '../model/BatchDetails.model';
import { BatchDetailsService } from './service/batch-details.service';
import { Router } from '@angular/router';
import { MenuItem } from '../model/MenuItem.model';
import { lastValueFrom } from 'rxjs';
import { HttpStatusCode } from '@angular/common/http';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';
@Component({
  selector: 'app-batch-details',
  templateUrl: './batch-details.component.html',
  styleUrls: ['./batch-details.component.css']
})
export class BatchDetailsComponent implements OnInit,AfterViewInit{


  private table : any;
  loggedInUserRole = localStorage.getItem('userRole');
  batchDetails:BatchDetails[];
  batchRecordsCount: number = 0;
   @Output() title:string='Batch Details';

     /**
    * 
    * @param reportservice 
    */
     constructor (private batchService:BatchDetailsService, private router: Router, private menuItemService: AppMenuItemService){}

  // initializeJqueryDataTable(){
  //   setTimeout(() => {
  //     $(document).ready(() => {
  //       this.table = $('#table').DataTable({
  //         paging: true,
  //         searching: true, // Enable search feature
  //         pageLength: 7,
  //         // Add other options here as needed
  //       });
  //     });
  //   },500)
  // }
  isBatchDetailsText:boolean=false;
  displayText:boolean=false;
  isComponentLoading:boolean=false;


   /**
    * 
    */
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
          this.batchService.getAllBatchProcessDetails().subscribe({
            next :   res=>{
              this.batchDetails = res.body;
              this.batchRecordsCount = res.body.length;
              if(this.batchRecordsCount===0){
                  this.displayText=false;
                  this.isComponentLoading=false;
              }else{
                  this.isComponentLoading=false;
                  this.isBatchDetailsText=false;
              }
         } });
          
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
      this.displayText=true;
      this.isComponentLoading=true;
      this.isBatchDetailsText=true;

    // if(this.loggedInUserRole != 'ADMIN' && this.loggedInUserRole != 'SUPER_ADMIN'){
    //   this.router.navigateByUrl('/unauthorized');
    // }
     //this.initializeJqueryDataTable();
   }

   ngAfterViewInit(): void {
    setTimeout(() => {
      $(document).ready(() => {
        this.table = $('#table').DataTable({
          paging: true,
          searching: true, // Enable search feature
          pageLength: 10,
          order: [[0,'asc']],
          lengthMenu: [ [10, 25, 50, -1], [10, 25, 50, "All"] ]
          // Add other options here as needed
        });
      });
    },900)
  }

   currentMenuItem: MenuItem;
  async getCurrentMenuItemDetails() : Promise<MenuItem> {
      const response =  await lastValueFrom(this.menuItemService.findMenuItemByName('Batch Details')).then(response => {
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


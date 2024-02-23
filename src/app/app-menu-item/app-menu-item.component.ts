import { AfterViewChecked, Component, Output } from '@angular/core';
import { MenuItem } from '../model/MenuItem.model';
import { AppMenuItemService } from './service/app-menu-item.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpStatusCode } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { error } from 'jquery';

@Component({
  selector: 'app-app-menu-items',
  templateUrl: './app-menu-item.component.html',
  styleUrls: ['./app-menu-item.component.css']
})
export class AppMenuItemsComponent implements AfterViewChecked {

  @Output() title = 'Menu Items';

  menuItem: MenuItem = new MenuItem();
  //existingTaskCategory: MenuItem = new MenuItem();
  private table: any;
  loggedInUser = localStorage.getItem('email');
  loggedInUserRole = localStorage.getItem('userRole')
  loggedInUserFullName = localStorage.getItem('firstName')+' '+localStorage.getItem('lastName');

  menuItemList: MenuItem[];
  isMenuItemDataText= false;
  isComponentLoading = false;

  viewPermission: boolean;
  createPermission: boolean;
  updatePermission: boolean;
  deletePermission: boolean;
  noPermissions: boolean;
  addButtonColor: string;
  deleteButtonColor: string;
  updateButtonColor: string;
  userRoleMenuItemsPermissionMap: Map<string, string>

  constructor(private menuItemService: AppMenuItemService, private toastrService: ToastrService,
    private router: Router){}

  async ngOnInit(): Promise<void> {
    // if(this.loggedInUserRole != 'ADMIN' && this.loggedInUserRole != 'SUPER_ADMIN'){
    //   this.router.navigateByUrl('/unauthorized');
    // }
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
          this.getMenuItems();
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
  initializeDataTable:boolean=false;
  ngAfterViewChecked(): void {
    this.initializeJqueryTable();
  }
   initializeJqueryTable(){
    if(this.menuItemsDataLoaded&&!this.initializeDataTable){
    this.table = $('#table').DataTable({
      paging: true,
      stateSave:true,
      searching: true, // Enable search feature
      pageLength: 10,
      order: [[1,'asc']],
      lengthMenu: [ [10, 25, 50, -1], [10, 25, 50, "All"] ],
      columnDefs:[{
        "targets": [0,9,10],
        "orderable":false
      }]
      // Add other options here as needed
    });
    this.initializeDataTable=true;
   }      
  }

  createOrUpdateMenuItem(){
    if(this.menuItem.menuItemId === 0){
      this.createMenuItem(this.menuItem);
    }else{
      this.updateMenuItem(this.menuItem)
    }
  }

  menuItemsDataLoaded:boolean=false;
  getMenuItems(){
    this.isComponentLoading=true;
    this.isMenuItemDataText=true;
    this.menuItemService.findMenuItems().subscribe({
      next: response => {
        this.menuItemList = response.body;
        this.menuItemsDataLoaded = true;
        this.isComponentLoading=false;
        this.isMenuItemDataText=false;
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      }
    })
  }

  menuItemsToBeDeleted: any[];
  removeAllSelectedmenuItems(){
    //initialize to empty array on clikck from second time
    this.menuItemsToBeDeleted = [];
   var subCheckBoxes = document.getElementsByClassName('subCheckBox') as HTMLCollectionOf<HTMLInputElement>;
   for(var i=0; i<subCheckBoxes.length; i++){
    if(subCheckBoxes[i].checked){
      this.menuItemsToBeDeleted.push(subCheckBoxes[i].value);
    }
   }
   if(this.menuItemsToBeDeleted.length>0){
    var isconfirmed = window.confirm('Are you sure, you really want to delete selected menu items ?')
    if(isconfirmed){
      this.menuItemService.deleteSelectedMenuItems(this.menuItemsToBeDeleted).subscribe({
        next:(response) => {
          if(response.status === HttpStatusCode.Ok){
            var isAllDeleted = response.body    
            if(this.menuItemsToBeDeleted.length > 1){
              this.toastrService.success('Menu items deleted sucessfully') 
            } else{
              this.toastrService.success('Menu item '+this.menuItemsToBeDeleted+' is deleted successfully') 
            }
            setTimeout(()=>{
              window.location.reload();
            },1000)  
          }else{
            this.toastrService.error('Error while deleting menu items... Please try again !');
          }
        },error: (error) => {
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout')
          }else if(error.status === HttpStatusCode.ImUsed){
            this.toastrService.error("One of the menu item is already in usage by a 'Role' ! Cannot be deleted.");
          }else{
            this.toastrService.error('Error while deleting Menu items')
          }
        }
      })
    }else{
      //this.toastrService.warning('Menu items not deleted.')
    }
   }else{
    this.toastrService.error('Please select atleast one Menu item to delete')
   }
  }

  removeMenuItem(menuItemId: number){
    var menuItemIds: number[] = [];
    menuItemIds.push(menuItemId);
    var isDeleteConfirmed = window.confirm('Are you sure, you really want to delete the menu item ?');
    if(isDeleteConfirmed){
      this.menuItemService.deleteSelectedMenuItems(menuItemIds).subscribe({
        next: response => {
          if(response.status === HttpStatusCode.Ok){
            this.toastrService.success('Menu item '+menuItemId+' deleted successfully');
            setTimeout(() => {
              window.location.reload();
            })
          }
        },error: error => {
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }else if(error.status === HttpStatusCode.ImUsed){
            this.toastrService.error("Menu item is already in usage by a 'Role' ! Cannot be deleted");
          }else {
            this.toastrService.error('Error while deleting menu item. Please try again !')
          }
        }
      })
    }else{
     // this.toastrService.warning('Menu item not deleted.')
    }
  }

  getMenuItem(menuItemId: number){
    this.menuItemService.findMenuItemById(menuItemId).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.menuItem = response.body;
        }
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }else {
          this.toastrService.error('Error while fetching menu item. Please try again !')
        }
      }
    })
  }

  updateMenuItem(menuItem: MenuItem){
    let isTitleValid = true;
    let isDescriptionValid = true;
    let isMenuItemPathValid = true;
    
    if(this.isMenuItemDescValid === false){
      var valid = this.validateMenuItemName();
      isTitleValid = valid;
    }
    if(this.isMenuItemDescValid === false){
     var valid = this.validateMenuItemDescription();
     isDescriptionValid = valid;
    }
    if(this.isMenuItemPathValid === false){
      var valid = this.validateMenuItemPath();
      isMenuItemPathValid = valid;
    }
    if(isTitleValid === true && isDescriptionValid === true && isMenuItemPathValid === true){
      menuItem.menuItemName=this.transformToTitleCase(this.menuItem.menuItemName);
      menuItem.modifiedByEmailId = this.loggedInUser;
      menuItem.modifiedBy = this.loggedInUserFullName;
      this.menuItemService.updateMenuItem(menuItem).subscribe({
        next: response => {
          if(response.status === HttpStatusCode.PartialContent){
            document.getElementById('closeModal').click();
            this.toastrService.success('Menu item '+menuItem.menuItemId+' updated successfully');
            setTimeout(() => {
              window.location.reload();
            },1000)
          }
        },error: error => {
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }else {
            this.toastrService.error('Error while creating the menu item. Please try again !')
          }
        }
      })
    }
  }


  createMenuItem(menuItem: MenuItem){
    let isTitleValid = true;
    let isDescriptionValid = true;
    let isMenuItemPathValid = true;
    
    if(this.isMenuItemNameValid === false){
      var valid = this.validateMenuItemName();
      isTitleValid = valid;
    }
    if(this.isMenuItemDescValid === false){
     var valid = this.validateMenuItemDescription();
     isDescriptionValid = valid;
    }
    if(this.isMenuItemPathValid === false){
      var valid = this.validateMenuItemPath();
      isMenuItemPathValid = valid;
    }
    if(isTitleValid === true && isDescriptionValid === true && isMenuItemPathValid === true){
      menuItem.menuItemName=this.transformToTitleCase(this.menuItem.menuItemName);
      menuItem.createdByEmailId = this.loggedInUser;
      menuItem.createdBy = this.loggedInUserFullName;
      this.menuItemService.createMenuItem(menuItem).subscribe({
        next: response => {
          if(response.status === HttpStatusCode.Created){
            document.getElementById('closeModal').click();
            this.toastrService.success('Menu item '+menuItem.menuItemName+' created successfully');
            setTimeout(() => {
              window.location.reload();
            },1000)
          }
        },error: error => {
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }else if(error.status === HttpStatusCode.Found){
            this.toastrService.error("Menu item '"+menuItem.menuItemName+"' already exists");
          }
          else {
            this.toastrService.error('Error while creating the menu item. Please try again !')
          }
        }
      })
    }
  }

  menuItemNameErrorInfo:string =''
  isMenuItemNameValid:boolean = false;
  validateMenuItemName(){
    const regex = /^\S.*[a-zA-Z\s]*$/;
    const regex2=/^[A-Za-z &]+$/;
    if(this.menuItem.menuItemName === '' || this.menuItem.menuItemName.trim()==="" || 
    regex.exec(this.menuItem.menuItemName)===null){
      this.menuItemNameErrorInfo = 'Menu item name is required';
      this.isMenuItemNameValid = false;
    }else if(regex2.test(this.menuItem.menuItemName) === false){
      this.menuItemNameErrorInfo = 'Menu item name cannot have special characters or numbers.';
      this.isMenuItemNameValid = false;
    }
    else if(this.menuItem.menuItemName.length < 2){
      this.menuItemNameErrorInfo = 'Menu item name should have minimum of 2 characters.';
      this.isMenuItemNameValid = false;
    }else if(this.menuItem.menuItemName.length > 50){
      this.menuItemNameErrorInfo = 'Menu item name should not exceed more than 50 characters';
      this.isMenuItemNameValid = false;
    }else{
      this.isMenuItemNameValid = true;
      this.menuItemNameErrorInfo = '';
    }
    return this.isMenuItemNameValid;
  }

  menuItemPathErrorInfo:string =''
  isMenuItemPathValid:boolean = false;
  validateMenuItemPath(){
    const regex = /^\S.*[a-zA-Z\s]*$/;
    const regex2 = /\\/;
    if(this.menuItem.menuItemPath === '' || this.menuItem.menuItemPath.trim()==="" || 
    regex.exec(this.menuItem.menuItemPath)===null){
      this.menuItemPathErrorInfo = 'Menu item path is required';
      this.isMenuItemPathValid = false;
    }else if(regex2.test(this.menuItem.menuItemPath)===true){
      this.menuItemPathErrorInfo="Menu item path cannot have backslash (instead use forwardslash)";
      this.isMenuItemPathValid=false;
    }else if(this.menuItem.menuItemPath.length < 3){
      this.menuItemPathErrorInfo = 'Menu item path should have minimum of 3 characters.';
      this.isMenuItemPathValid = false;
    }else if(this.menuItem.menuItemPath.length > 50){
      this.menuItemPathErrorInfo = 'Menu item path should not exceed more than 50 characters';
      this.isMenuItemPathValid = false;
    }else{
      this.isMenuItemPathValid = true;
      this.menuItemPathErrorInfo = '';
    }
    return this.isMenuItemPathValid;
  }

  menuItemDescErrorInfo:string =''
  isMenuItemDescValid:boolean = false;
  validateMenuItemDescription(){
    const regex = /^(?!\s)[\s\S]*$/;
    if(this.menuItem.menuItemDescription === '' || this.menuItem.menuItemDescription.trim()==="" || 
    regex.exec(this.menuItem.menuItemDescription)===null){
      this.menuItemDescErrorInfo = 'Menu item description is required';
      this.isMenuItemDescValid = false;
    }else if(this.menuItem.menuItemDescription.length < 5){
      this.menuItemDescErrorInfo = 'Menu item description should have minimum of 5 characters.';
      this.isMenuItemDescValid = false;
    }else if(this.menuItem.menuItemDescription.length > 100){
      this.menuItemDescErrorInfo = 'Menu item description should not exceed more than 100 characters';
      this.isMenuItemDescValid = false;
    }else{
      this.isMenuItemDescValid = true;
      this.menuItemDescErrorInfo = '';
    }
    return this.isMenuItemDescValid;
  }


  clearErrorMessages(){
    this.menuItem.menuItemName = '';
    this.menuItem.menuItemDescription = '';
    this.menuItem.menuItemPath = '';

    this.isMenuItemNameValid = false;
    this.isMenuItemDescValid = false;
    this.isMenuItemPathValid=false;
    
    this.menuItemNameErrorInfo = '';
    this.menuItemDescErrorInfo = '';
    this.menuItemPathErrorInfo = '';
    
  }

   /**
   * 
   */
   toggleMainCheckBox(index: number) {
    if (!$('#ac-check' + index).is(':checked')) {
      $('.mainCheckBox').prop('checked', false);
    }
    const anyUnchecked = $('.subCheckBox:not(:checked)').length > 0;
    $('#mainCheckBox').prop('checked', !anyUnchecked);

  }

   /**
   * 
   */
   checkSubCheckBoxes() {
    if ($('#mainCheckBox').is(':checked')) {
      $('.subCheckBox').prop('checked', true);
    } else {
      $('.subCheckBox').prop('checked', false);
    }
  }

  transformToTitleCase(text: string): string {
    return text.toLowerCase().split(' ').map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  currentMenuItem: MenuItem;
  async getCurrentMenuItemDetails() : Promise<MenuItem> {
      const response =  await lastValueFrom(this.menuItemService.findMenuItemByName('Menu Items')).then(response => {
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

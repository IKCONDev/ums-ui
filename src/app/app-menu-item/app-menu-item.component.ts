import { Component, Output } from '@angular/core';
import { MenuItem } from '../model/MenuItem.model';
import { AppMenuItemService } from './service/app-menu-item.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-app-menu-items',
  templateUrl: './app-menu-item.component.html',
  styleUrls: ['./app-menu-item.component.css']
})
export class AppMenuItemsComponent {

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

  constructor(private menuItemService: AppMenuItemService, private toastrService: ToastrService,
    private router: Router){}

  ngOnInit(): void {
    if(this.loggedInUserRole != 'ADMIN' && this.loggedInUserRole != 'SUPER_ADMIN'){
      this.router.navigateByUrl('/unauthorized');
    }
    this.getMenuItems()
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

  createOrUpdateMenuItem(){
    if(this.menuItem.menuItemId === 0){
      this.createMenuItem(this.menuItem);
    }else{
      this.updateMenuItem(this.menuItem)
    }
  }


  getMenuItems(){
    this.isComponentLoading=true;
    this.isMenuItemDataText=true;
    this.menuItemService.findMenuItems().subscribe({
      next: response => {
        this.menuItemList = response.body;
        this.isComponentLoading=false;
        this.isMenuItemDataText=false;
        console.log(response.body)
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
      console.log(this.menuItemsToBeDeleted);
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
              this.toastrService.success('Menu items '+this.menuItemsToBeDeleted+' are deleted.') 
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
          }
        }
      })
    }else{
      this.toastrService.warning('Menu items not deleted')
    }
   }else{
    this.toastrService.error('Please select atleast one Menu item to delete.')
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
          }else {
            this.toastrService.error('Error while deleting menu item. Please try again !')
          }
        }
      })
    }else{
      this.toastrService.warning('Menu item not deleted.')
    }
  }

  getMenuItem(menuItemId: number){
    this.menuItemService.findMenuItemById(menuItemId).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.menuItem = response.body;
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
    console.log(menuItem.menuItemId)
    console.log('true')
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
    if(this.menuItem.menuItemName === '' || this.menuItem.menuItemName.trim()==="" || 
    regex.exec(this.menuItem.menuItemName)===null){
      this.menuItemNameErrorInfo = 'Menu item name is required';
      this.isMenuItemNameValid = false;
    }else if(this.menuItem.menuItemName.length < 3){
      this.menuItemNameErrorInfo = 'Menu item name should have minimum of 2 characters.';
      this.isMenuItemNameValid = false;
    }else if(this.menuItem.menuItemName.length > 50){
      this.menuItemNameErrorInfo = 'Menu item name should not exceed more than 25 characters';
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
    if(this.menuItem.menuItemName === '' || this.menuItem.menuItemName.trim()==="" || 
    regex.exec(this.menuItem.menuItemName)===null){
      this.menuItemPathErrorInfo = 'Menu item path is required';
      this.isMenuItemPathValid = false;
    }else if(this.menuItem.menuItemName.length < 3){
      this.menuItemPathErrorInfo = 'Menu item path should have minimum of 4 characters.';
      this.isMenuItemPathValid = false;
    }else if(this.menuItem.menuItemName.length > 50){
      this.menuItemPathErrorInfo = 'Menu item path should not exceed more than 30 characters';
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
    const regex = /^\S.*[a-zA-Z\s]*$/;
    if(this.menuItem.menuItemDescription === '' || this.menuItem.menuItemDescription.trim()==="" || 
    regex.exec(this.menuItem.menuItemDescription)===null){
      this.menuItemDescErrorInfo = 'Menu item description is required';
      this.isMenuItemDescValid = false;
    }else if(this.menuItem.menuItemDescription.length < 5){
      this.menuItemDescErrorInfo = 'Menu item description should have minimum of 5 characters.';
      this.isMenuItemDescValid = false;
    }else if(this.menuItem.menuItemDescription.length > 50){
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

    this.isMenuItemNameValid = false;
    this.isMenuItemDescValid = false;

    this.menuItemNameErrorInfo = '';
    this.menuItemDescErrorInfo = '';
    
  }

   /**
   * 
   */
   toggleMainCheckBox(index: number) {
    if (!$('#subCheckBox' + index).is(':checked')) {
      $('#mainCheckBox').prop('checked', false);
    }

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

}

import { AfterViewChecked, Component, OnInit, Output } from '@angular/core';
import { TaskCategory } from '../model/TaskCategory.model';
import { TaskCategoryService } from './service/task-category.service';
import { HttpStatusCode } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { error } from 'jquery';
import { flatMap, lastValueFrom } from 'rxjs';
import { MenuItem } from '../model/MenuItem.model';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';

@Component({
  selector: 'app-task-category',
  templateUrl: './task-category.component.html',
  styleUrls: ['./task-category.component.css']
})
export class TaskCategoryComponent implements OnInit,AfterViewChecked{
 
  @Output() title = 'Task Categories';
  taskCategory: TaskCategory = new TaskCategory();
  existingTaskCategory: TaskCategory = new TaskCategory();
  private table: any;
  loggedInUser = localStorage.getItem('email');
  loggedInUserRole = localStorage.getItem('userRole')
  loggedInUserFullName = localStorage.getItem('firstName')+' '+localStorage.getItem('lastName');
  taskCategoryList: TaskCategory[];
  isComponentLoading:boolean=false;
  isTaskCategoryDataText:boolean=false;
  viewPermission: boolean;
  createPermission: boolean;
  updatePermission: boolean;
  deletePermission: boolean;
  noPermissions: boolean;
  addButtonColor: string;
  deleteButtonColor: string;
  updateButtonColor: string;
  userRoleMenuItemsPermissionMap: Map<string, string>

  constructor(private taskCategoryService: TaskCategoryService, private toastrService: ToastrService,
    private router: Router, private menuItemService: AppMenuItemService){}

  async ngOnInit(): Promise<void> {
    // if(this.loggedInUserRole != 'ADMIN' && this.loggedInUserRole != 'SUPER_ADMIN'){
    //   this.router.navigateByUrl('/unauthorized');
    // }
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
          this.getAllTaskcategories();
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

  ngAfterViewChecked(): void {
    this.initializeJqueryTable();
  }

  dataTableInitialized:boolean=false;
  initializeJqueryTable(){
    
    if(this.taskCategoryDataLoaded&&!this.dataTableInitialized){
    this.table = $('#table').DataTable({
      paging: true,
      searching: true, // Enable search feature
      pageLength: 10,
      order: [[0,'asc']],
      lengthMenu: [ [10, 25, 50, -1], [10, 25, 50, "All"] ]
      // Add other options here as needed
    });
    this.dataTableInitialized = true;
  
}
  }

  createOrUpdateTaskCategory(){
    if(this.taskCategory.taskCategoryId === 0){
      this.createTaskCategory(this.taskCategory);
    }else{
      this.updateTaskCategory(this.taskCategory)
    }
  }

  taskCategoryDataLoaded:boolean=false;
  getAllTaskcategories(){
    this.isComponentLoading=true;
    this.isTaskCategoryDataText=true;
    setTimeout(()=>{
      this.isComponentLoading=false;
      this.isTaskCategoryDataText=false;
    },200)
    this.taskCategoryService.getAllTaskCategories().subscribe({
      next: response => {
        this.taskCategoryList = response.body;
        this.taskCategoryDataLoaded=true;
          this.isComponentLoading=false;
          this.isTaskCategoryDataText=false;
      }
    })
  }

  taskcategoriesToBeDeleted: any[];
  removeAllSelectedTaskCategories(){
    //initialize to empty array on clikck from second time
    this.taskcategoriesToBeDeleted = [];
   var subCheckBoxes = document.getElementsByClassName('subCheckBox') as HTMLCollectionOf<HTMLInputElement>;
   for(var i=0; i<subCheckBoxes.length; i++){
    if(subCheckBoxes[i].checked){
      this.taskcategoriesToBeDeleted.push(subCheckBoxes[i].value);
    }
   }
   if(this.taskcategoriesToBeDeleted.length>0){
    var isconfirmed = window.confirm('Are you sure, you really want to delete selected task categories ?')
    if(isconfirmed){
      this.taskCategoryService.deleteSelectedTaskCategories(this.taskcategoriesToBeDeleted).subscribe({
        next:(response) => {
          if(response.status === HttpStatusCode.Ok){
            var isAllDeleted = response.body    
            if(this.taskcategoriesToBeDeleted.length > 1){
              this.toastrService.success('Task categories deleted sucessfully.') 
            } else{
              this.toastrService.success('Task category '+this.taskcategoriesToBeDeleted+' is deleted.') 
            }
            setTimeout(()=>{
              window.location.reload();
            },1000)  
          }else{
            this.toastrService.error('Error occured while deleting task categories. Please try again !');
          }
        },error: (error) => {
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout')
          }
        }
      })
    }else{
      this.toastrService.warning('Task categories not deleted.')
    }
   }else{
    this.toastrService.error('Please select atleast one task category to delete.')
   }
  }

  removeTaskCategory(categoryId: number){
    var categoryIds: number[] = [];
    categoryIds.push(categoryId);
    var isDeleteConfirmed = window.confirm('Are you sure, you really want to delete the task category ?');
    if(isDeleteConfirmed){
      this.taskCategoryService.deleteSelectedTaskCategories(categoryIds).subscribe({
        next: response => {
          if(response.status === HttpStatusCode.Ok){
            this.toastrService.success('Task category '+categoryId+' deleted successfully.');
            setTimeout(() => {
              window.location.reload();
            })
          }
        },error: error => {
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }else {
            this.toastrService.error('Error occured while deleting task category . Please try again !')
          }
        }
      })
    }else{
      this.toastrService.warning('Task category not deleted.')
    }
  }

  getTaskCategoryById(categoryId: number){
    this.taskCategoryService.getTaskCatgeoryById(categoryId).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.taskCategory = response.body;
        }
      }
    })
  }

  updateTaskCategory(taskCategory: TaskCategory){
    let isTitleValid = true;
    let isDescriptionValid = true;
    
    if(this.isCategoryTitleValid === false){
      var valid = this.validateTaskCategoryTitle();
      isTitleValid = valid;
    }
    if(this.isCategoryDescValid === false){
     var valid = this.validateTaskCategoryDescription();
     isDescriptionValid = valid;
    }
    if(isTitleValid === true && isDescriptionValid === true){
      taskCategory.taskCategoryTitle=this.transformToTitleCase(this.taskCategory.taskCategoryTitle);
      
      taskCategory.modifiedByEmailId = this.loggedInUser;
      taskCategory.modifiedBy = this.transformToTitleCase(this.loggedInUserFullName);
      this.taskCategoryService.updateTaskCategory(taskCategory).subscribe({
        next: response => {
          if(response.status === HttpStatusCode.Created){
            this.closeModal();
            this.toastrService.success("Task category has been updated successfully.");
            setTimeout(() => {
              window.location.reload();
            },1000)
          }
        },error: error => {
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }else {
            this.toastrService.error('Error occured while updating the task category. Please try again !')
          }
        }
      })
    }
  }

  closeModal(){
    document.getElementById('closeModal').click();
  }


  createTaskCategory(taskCategory: TaskCategory){
    let isTitleValid = true;
    let isDescriptionValid = true;
    
    if(this.isCategoryTitleValid === false){
      var valid = this.validateTaskCategoryTitle();
      isTitleValid = valid;
    }
    if(this.isCategoryDescValid === false){
     var valid = this.validateTaskCategoryDescription();
     isDescriptionValid = valid;
    }
    if(isTitleValid === true && isDescriptionValid === true){

      taskCategory.taskCategoryTitle=this.transformToTitleCase(this.taskCategory.taskCategoryTitle);

      taskCategory.createdByEmailId = this.loggedInUser;
      taskCategory.createdBy = this.transformToTitleCase(this.loggedInUserFullName);
      this.taskCategoryService.createTaskCategory(taskCategory).subscribe({
        next: response => {
          if(response.status === HttpStatusCode.Created){
            this.toastrService.success('Task category created successfully.');
            this.closeModal();
            setTimeout(() => {
              window.location.reload();
            },1000)
          }
        },error: error => {
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }else if(error.status === HttpStatusCode.Found){
            this.toastrService.error("Task category already exists.");
            //this.closeModal();
          }
          else {
            this.toastrService.error('Error occured while creating the task category. Please try again !')
          }
        }
      })
    }
  }

  categoryTitleErrorInfo:string =''
  isCategoryTitleValid:boolean = false;
  validateTaskCategoryTitle(){
    const regex = /^\S.*[a-zA-Z\s]*$/;
    const regex2=/^[A-Za-z ]+$/;
    if(this.taskCategory.taskCategoryTitle === '' || this.taskCategory.taskCategoryTitle.trim()==="" || 
    regex.exec(this.taskCategory.taskCategoryTitle)===null){
      this.categoryTitleErrorInfo = 'Task category name is required.';
      this.isCategoryTitleValid = false;
    }else if(regex2.test(this.taskCategory.taskCategoryTitle) === false){
      this.categoryTitleErrorInfo = 'Task category name cannot have special characters or numbers.';
      this.isCategoryTitleValid = false;
    }
    else if(this.taskCategory.taskCategoryTitle.length < 3){
      this.categoryTitleErrorInfo = 'Task category name should have minimum of 3 characters.';
      this.isCategoryTitleValid = false;
    }else if(this.taskCategory.taskCategoryTitle.length > 50){
      this.categoryTitleErrorInfo = 'Task category name should not exceed more than 50 characters';
      this.isCategoryTitleValid = false;
    }else{
      this.isCategoryTitleValid = true;
      this.categoryTitleErrorInfo = '';
    }
    return this.isCategoryTitleValid;
  }

  categoryDescErrorInfo:string =''
  isCategoryDescValid:boolean = false;
  validateTaskCategoryDescription(){
    const regex = /^\S.*[a-zA-Z\s]*$/;
    if(this.taskCategory.taskCategoryDescription === '' || this.taskCategory.taskCategoryDescription.trim()==="" || 
    regex.exec(this.taskCategory.taskCategoryDescription)===null){
      this.categoryDescErrorInfo = 'Task category description is required.';
      this.isCategoryDescValid = false;
    }else if(this.taskCategory.taskCategoryDescription.length < 5){
      this.categoryDescErrorInfo = 'Task category description should have minimum of 5 characters.';
      this.isCategoryDescValid = false;
    }else if(this.taskCategory.taskCategoryDescription.length > 100){
      this.categoryDescErrorInfo = 'Task category description should not exceed more than 100 characters.';
      this.isCategoryDescValid = false;
    }else{
      this.isCategoryDescValid = true;
      this.categoryDescErrorInfo = '';
    }
    return this.isCategoryDescValid;
  }


  clearErrorMessages(){
    this.taskCategory.taskCategoryTitle = '';
    this.taskCategory.taskCategoryDescription = '';

    this.isCategoryTitleValid = false;
    this.isCategoryDescValid = false;

    this.categoryTitleErrorInfo = '';
    this.categoryDescErrorInfo = '';
    
  }

   /**
   * 
   */
   toggleMainCheckBox(index: number) {
    if (!$('#subCheckBox' + index).is(':checked')) {
      $('#mainCheckBox').prop('checked', false);
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
      const response =  await lastValueFrom(this.menuItemService.findMenuItemByName('Task Categories')).then(response => {
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

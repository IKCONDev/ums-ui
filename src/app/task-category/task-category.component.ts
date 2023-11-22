import { Component, OnInit, Output } from '@angular/core';
import { TaskCategory } from '../model/TaskCategory.model';
import { TaskCategoryService } from './service/task-category.service';
import { HttpStatusCode } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { error } from 'jquery';
import { flatMap } from 'rxjs';

@Component({
  selector: 'app-task-category',
  templateUrl: './task-category.component.html',
  styleUrls: ['./task-category.component.css']
})
export class TaskCategoryComponent implements OnInit {
 
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

  constructor(private taskCategoryService: TaskCategoryService, private toastrService: ToastrService,
    private router: Router){}

  ngOnInit(): void {
    if(this.loggedInUserRole != 'ADMIN' && this.loggedInUserRole != 'SUPER_ADMIN'){
      this.router.navigateByUrl('/unauthorized');
    }
    this.getTaskcategories()
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
    if(this.taskCategory.taskCategoryId === 0){
      this.createTaskCategory(this.taskCategory);
    }else{
      this.updateTaskCategory(this.taskCategory)
    }
  }


  getTaskcategories(){
    this.isComponentLoading=true;
    this.isTaskCategoryDataText=true;
    this.taskCategoryService.findTaskCategories().subscribe({
      next: response => {
        this.taskCategoryList = response.body;
        setTimeout(()=>{
          this.isComponentLoading=false;
          this.isTaskCategoryDataText=false;
        },400)
        console.log(response.body)
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
      console.log(this.taskcategoriesToBeDeleted);
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
              this.toastrService.success('Task categories deleted sucessfully') 
            } else{
              this.toastrService.success('Task categories '+this.taskcategoriesToBeDeleted+' are deleted.') 
            }
            setTimeout(()=>{
              window.location.reload();
            },1000)  
          }else{
            this.toastrService.error('Error while deleting task categories... Please try again !');
          }
        },error: (error) => {
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout')
          }
        }
      })
    }else{
      this.toastrService.warning('Task categories not deleted')
    }
   }else{
    this.toastrService.error('Please select atleast one Task category to delete.')
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
            this.toastrService.error('Error while deleting task category . Please try again !')
          }
        }
      })
    }else{
      this.toastrService.warning('Task category nor deleted.')
    }
  }

  getTaskCategory(categoryId: number){
    this.taskCategoryService.findTaskCatgeoryById(categoryId).subscribe({
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
      taskCategory.modifiedByEmailId = this.loggedInUser;
      taskCategory.modifiedBy = this.loggedInUserFullName;
      this.taskCategoryService.updateTaskCategory(taskCategory).subscribe({
        next: response => {
          if(response.status === HttpStatusCode.Created){
            this.closeModal();
            this.toastrService.success('Task category '+taskCategory.taskCategoryTitle+' updated successfully');
            setTimeout(() => {
              window.location.reload();
            },1000)
          }
        },error: error => {
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }else {
            this.toastrService.error('Error while creating the task category. Please try again !')
          }
        }
      })
    }
  }

  closeModal(){
    document.getElementById('closeModal').click();
  }


  createTaskCategory(taskCategory: TaskCategory){
    console.log(taskCategory.taskCategoryId)
    console.log('true')
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
      taskCategory.createdByEmailId = this.loggedInUser;
      taskCategory.createdBy = this.loggedInUserFullName;
      this.taskCategoryService.createTaskCategory(taskCategory).subscribe({
        next: response => {
          if(response.status === HttpStatusCode.Created){
            this.closeModal();
            this.toastrService.success('Task category '+taskCategory.taskCategoryTitle+' created successfully');
            setTimeout(() => {
              window.location.reload();
            },1000)
          }
        },error: error => {
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }else if(error.status === HttpStatusCode.Found){
            this.toastrService.error("Task category '"+taskCategory.taskCategoryTitle+"' already exists");
          }
          else {
            this.toastrService.error('Error while creating the task category. Please try again !')
          }
        }
      })
    }
  }

  categoryTitleErrorInfo:string =''
  isCategoryTitleValid:boolean = false;
  validateTaskCategoryTitle(){
    const regex = /^\S.*[a-zA-Z\s]*$/;
    if(this.taskCategory.taskCategoryTitle === '' || this.taskCategory.taskCategoryTitle.trim()==="" || 
    regex.exec(this.taskCategory.taskCategoryTitle)===null){
      this.categoryTitleErrorInfo = 'Task category name/title is required';
      this.isCategoryTitleValid = false;
    }else if(this.taskCategory.taskCategoryTitle.length < 3){
      this.categoryTitleErrorInfo = 'Task category name/title should have minimum of 3 characters.';
      this.isCategoryTitleValid = false;
    }else if(this.taskCategory.taskCategoryTitle.length > 50){
      this.categoryTitleErrorInfo = 'Task category name/title should not exceed more than 50 characters';
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
      this.categoryDescErrorInfo = 'Task category description is required';
      this.isCategoryDescValid = false;
    }else if(this.taskCategory.taskCategoryDescription.length < 5){
      this.categoryDescErrorInfo = 'Task category description should have minimum of 5 characters.';
      this.isCategoryDescValid = false;
    }else if(this.taskCategory.taskCategoryDescription.length > 50){
      this.categoryDescErrorInfo = 'Task category description should not exceed more than 100 characters';
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
    console.log(anyUnchecked);
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

}

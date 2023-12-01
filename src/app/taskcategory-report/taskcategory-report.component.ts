import { Component, OnInit, Output } from '@angular/core';
import { TaskCategoryService } from '../task-category/service/task-category.service';
import { Router } from '@angular/router';
import { TaskCategory } from '../model/TaskCategory.model';

@Component({
  selector: 'app-taskcategory-report',
  templateUrl: './taskcategory-report.component.html',
  styleUrls: ['./taskcategory-report.component.css']
})
export class TaskcategoryReportComponent implements OnInit {

  @Output()  title = 'Task Category'
  ngOnInit(): void {

    this.getAllTaskCategoryList();
  }
  constructor(private taskCategoryService: TaskCategoryService, private router: Router){}
  taskCategoryList : TaskCategory[];
  getAllTaskCategoryList(){
    this.taskCategoryService.getAllTaskCategories().subscribe({
       next : response =>{
         this.taskCategoryList = response.body;
       }
    })
  }
  getAllTasksByTaskcategory(){

  }
}

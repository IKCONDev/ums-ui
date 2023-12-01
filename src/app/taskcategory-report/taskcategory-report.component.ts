import { Component, OnInit, Output } from '@angular/core';
import { TaskCategoryService } from '../task-category/service/task-category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskCategory } from '../model/TaskCategory.model';
import { param } from 'jquery';
import { TaskService } from '../task/service/task.service';
import { Task } from '../model/Task.model';
import { TaskCategoryReport } from './service/taskcategoryreport.service';

@Component({
  selector: 'app-taskcategory-report',
  templateUrl: './taskcategory-report.component.html',
  styleUrls: ['./taskcategory-report.component.css']
})
export class TaskcategoryReportComponent implements OnInit {

  @Output()  title = 'Task Category'
  reportType: string;
  selectedTaskCategory : string;
  ngOnInit(): void {

    this.getAllTaskCategoryList();
    this.getAllTasksByTaskcategory();
    setTimeout(() => {
      if(this.reportType === 'all'){
       // this.getAllTaskCategoryList();
      }
      
    },400)

  }
  constructor(private taskCategoryService: TaskCategoryService, private router: Router, private activatedRoute : ActivatedRoute,
    private taskservice: TaskService, private taskCategoryReportservice : TaskCategoryReport
    ){
    this.activatedRoute.queryParams.subscribe(param =>{
       this.reportType = param['reportType'];
    })
  }
  taskCategoryList : TaskCategory[];
  getAllTaskCategoryList(){
    this.taskCategoryService.getAllTaskCategories().subscribe({
       next : response =>{
         this.taskCategoryList = response.body;
       }
    })
  }
  taskList : Task[]
  alltasksCount : number;
  getAllTasksByTaskcategory(){
    this.taskservice.getAlltasks().subscribe({
       next : response =>{
         this.taskList = response.body;
         this.alltasksCount = response.body.length;
       }
    })
  }
  taskListByCategory : Task[]
  categoryOfTaskCount : number;
  getchoosenCategory(){
    console.log(this.selectedTaskCategory);
    this.taskCategoryReportservice.getAllTasksByTaskCategoryId(parseInt(this.selectedTaskCategory)).subscribe({
      next : response =>{
        this.taskListByCategory = response.body;
        console.log(this.taskListByCategory);
        //this.categoryOfTaskCount = response.body.length;
        
      }
    })
  }

} 

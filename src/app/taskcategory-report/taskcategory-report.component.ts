import { Component, OnInit, Output } from '@angular/core';
import { TaskCategoryService } from '../task-category/service/task-category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskCategory } from '../model/TaskCategory.model';
import { param } from 'jquery';

@Component({
  selector: 'app-taskcategory-report',
  templateUrl: './taskcategory-report.component.html',
  styleUrls: ['./taskcategory-report.component.css']
})
export class TaskcategoryReportComponent implements OnInit {

  @Output()  title = 'Task Category'
  reportType: string;
  ngOnInit(): void {

    this.getAllTaskCategoryList();
    setTimeout(() => {
      if(this.reportType === 'all'){
        this.getAllTaskCategoryList();
      }
      
    },400)

  }
  constructor(private taskCategoryService: TaskCategoryService, private router: Router, private activatedRoute : ActivatedRoute){
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
  getAllTasksByTaskcategory(){

  }
}

import { Component, OnInit, Output } from '@angular/core';
import { TaskCategoryService } from '../task-category/service/task-category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskCategory } from '../model/TaskCategory.model';
import { param } from 'jquery';
import { TaskService } from '../task/service/task.service';
import { Task } from '../model/Task.model';
import { TaskCategoryReport } from './service/taskcategoryreport.service';
import { TaskCategoryCount } from '../model/TaskCategoryCount.model';
import { HttpStatus } from '@azure/msal-common';
import { HttpStatusCode } from '@angular/common/http';
import { TaskCategoryComponent } from '../task-category/task-category.component';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-taskcategory-report',
  templateUrl: './taskcategory-report.component.html',
  styleUrls: ['./taskcategory-report.component.css']
})
export class TaskcategoryReportComponent implements OnInit {

  @Output()  title = 'Task Category'
  reportType: string;
  selectedTaskCategory : string;
  taskListByCategoryChart = null
  ngOnInit(): void {

    this.getAllTaskCategoryList();
    this.getAllTasksByTaskcategory();
    //this.getAllTasksByCategoryCount();
    setTimeout(() => {
      if(this.reportType === 'all'){
        this.getAllTasksByCategoryCount();
        this.getchoosenCategory(this.selectedTaskCategory); 
      }
      if(this.reportType !='all'){
        this.getTaskCategoryId(parseInt(this.valueoftaskCategory))
        this.getchoosenCategory(this.valueoftaskCategory)
      }

      
    },200)

  }
  valueoftaskCategory : string;
  value : string[]
  constructor(private taskCategoryService: TaskCategoryService, private router: Router, private activatedRoute : ActivatedRoute,
    private taskservice: TaskService, private taskCategoryReportservice : TaskCategoryReport
    ){
    this.activatedRoute.queryParams.subscribe(param =>{
       this.reportType = param['reportType'];
       console.log(this.reportType);
      this.value = this.reportType.split(',')
       console.log(this.value[1])
       this.valueoftaskCategory = this.value[1]
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
  selectedtaskCategoryName : string;
  getchoosenCategory(selectedCategory : string){
     this.selectedTaskCategory = selectedCategory;
    console.log(this.selectedTaskCategory);
    if (this.taskListByCategoryChart != null) {
      this.taskListByCategoryChart.destroy();
      
    }
    this.getTaskCategoryId(parseInt(this.selectedTaskCategory))
    this.taskCategoryReportservice.getAllTasksByTaskCategoryId(parseInt(this.selectedTaskCategory)).subscribe({
      next : response =>{
        this.taskListByCategory = response.body;
        console.log(this.taskListByCategory);
        this.categoryOfTaskCount = response.body.length;
        setTimeout(() => {  
          this.createTaskListByDepartmentChart();
        }, 400)
      }
    })
  }
  selectedCategoryObject : TaskCategory
  getTaskCategoryId(selectedTaskCategory : number){
     this.taskCategoryService.getTaskCatgeoryById(selectedTaskCategory).subscribe({
        next : response =>{
          if(response.status == HttpStatusCode.Ok){
            this.selectedCategoryObject = response.body;
            this.selectedtaskCategoryName = this.selectedCategoryObject.taskCategoryTitle;
          }
           
        }
     })

  }
  taskCategoryCount : TaskCategoryCount[]
  taskObjectString : string[]
  finaltaskCategoryObject : TaskCategoryCount[] = []
  getAllTasksByCategoryCount(){
    this.taskCategoryReportservice.getAllTasksByCategoryCount().subscribe({
      next : response =>{
         this.taskCategoryCount = response.body;
         console.log(this.taskCategoryCount);
         this.taskCategoryCount.forEach(taskCategory1 =>{
            var taskCategoryString = (String)(taskCategory1);
            this.taskObjectString = taskCategoryString.split(',')
            var taskCategoryObject = new TaskCategoryCount();
            taskCategoryObject.taskCategoryId = parseInt(this.taskObjectString[0]);
            taskCategoryObject.taskCategoryCount = parseInt(this.taskObjectString[1]);
            this.finaltaskCategoryObject.push(taskCategoryObject);
          
         })
         this.getAllTaskCategoryNames();
      }
    })
  }
  getAllTaskCategoryNames(){
    this.getAllTaskCategoryList();
    this.taskCategoryList.forEach(taskCategory=>{
       this.finaltaskCategoryObject.map(categoryObject=>{
         if(taskCategory.taskCategoryId == categoryObject.taskCategoryId){
           categoryObject.taskCategoryTitle = taskCategory.taskCategoryTitle;
         }
       })
    })
  }
  createTaskListByDepartmentChart() {
    console.log("create task category chart entered");
    this.taskListByCategoryChart = new Chart("taskListByCategoryChart", {
      type: 'pie',
      data: {// values on X-Axis
        xLabels: ['Total tasks'],
        datasets: [
          {
            label: "Total Tasks of a task category",
            data: [this.categoryOfTaskCount],
            backgroundColor: 'rgba(255, 99, 132, 0.8)', // Red
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 3,
          },
        ]

      },
      options: {
        aspectRatio: 2.2,
        scales: {
          x: {
            display: true,
            grid: {
              display: false,
            },
          },
          y: {
            display: true,
            grid: {
              display: true,
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'center',
            labels: {
              usePointStyle: true,
              font: {
                size: 12,
              },
              padding: 16,
              pointStyle: 'rectRounded',

            },
          },
          title: {
            display: true,
            text: 'Total task list for a category',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }


} 

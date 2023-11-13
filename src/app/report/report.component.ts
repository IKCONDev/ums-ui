import { Component, Output } from '@angular/core';
import { OnInit } from '@angular/core';
import { ReportService } from './service/reports.service';
import { BatchDetails } from '../model/BatchDetails.model';
import { Chart } from 'chart.js';
import { DepartmentService } from '../department/service/department.service';
import { Department } from '../model/Department.model';
import { Task } from '../model/Task.model';
import { HeaderService } from '../header/service/header.service';
import { Users } from '../model/Users.model';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

  batchDetails:BatchDetails[];
   @Output() title:string='Reports'
   departmentList: Department[];
   selectedDepartment: number = 1;

   taskList : Task[];
   taskListCount = 0;
   taskListChart=null;

   taskListByDepartmentCount = 0;
   taskListByDepartment: Task[];
   taskListByDepartmentChart = null;

   loggedInUser = localStorage.getItem('email');

   /**
    * 
    * @param reportservice 
    */
   constructor (private reportservice:ReportService, 
                private departmentService: DepartmentService,
                private headerService: HeaderService){}

   /**
    * 
    */
   ngOnInit(): void {

    this.departmentService.getDepartmentList().subscribe({
      next: response => {
        this.departmentList = response.body;
        console.log(this.departmentList)
      }
    })

    //get batch process details
      this.reportservice.getAllBatchProcessDetails().subscribe(
         res=>{
          this.batchDetails = res.body;
          console.log(this.batchDetails);
             this.batchDetails.filter(batchDetail => {
             
           })
     });

     //show task List report
     this.getTasks();
     setTimeout(()=> {
      this.createTaskListChart(this.taskListCount);
     },200)

     //show task List by department report
     this.getTasksByDepartment(this.selectedDepartment);
    setTimeout(() => {
      this.createTaskListByDepartmentChart();
    },200)
   }

   userDetaiils: Users
   getLoggedInUserDetails(loggedInUser: string){
    this.headerService.fetchUserProfile(loggedInUser).subscribe({
      next: response => {
        this.userDetaiils = response.body;
        this.selectedDepartment = response.body.employee.department;
      }
    })
   }

   getTasks(){
    this.reportservice.findAllTasks().subscribe({
      next: response => {
        console.log(response.body)
        this.taskListCount = response.body.length;
      }
    })
   }

  createTaskListChart(taskListCount: number){
     this.taskListChart = new Chart("taskListChart", {
      type: 'bar',
      data: {// values on X-Axis
        xLabels: ['Total tasks'],
	       datasets: [
          {
            label: "Total Task",
            data: [this.taskListCount],
            backgroundColor: 'rgba(255, 99, 132, 0.8)', // Red
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 3,
          },
        ]
        
      },
      options: {
        aspectRatio: 1.77,
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
            align:'center',
            labels: {
              usePointStyle: true,
              font: {
                size: 12,
              },
              padding: 16,
              pointStyle:'rectRounded',
          
            },
          },
          title: {
            display: true,
            text: 'Total task list of all users',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }

  getTasksByDepartment(selectedDepartment: number){
    this.reportservice.findAllTasksByDepartment(this.selectedDepartment).subscribe({
      next: response => {
        this.taskListByDepartment = response.body;
        this.taskListByDepartmentCount = response.body.length;
        console.log(response.body)
      }
    })
  }

  chooseDepartment(event: any){
    if(this.taskListByDepartmentChart != null){
      this.taskListByDepartmentChart.destroy();
    }
    this.getTasksByDepartment(this.selectedDepartment);
    setTimeout(() => {
      this.createTaskListByDepartmentChart();
    },100)
    
  }

  createTaskListByDepartmentChart(){
    this.taskListByDepartmentChart = new Chart("taskListByDepartmentChart", {
     type: 'bar',
     data: {// values on X-Axis
       xLabels: ['Total tasks'],
        datasets: [
         {
           label: "Total Task",
           data: [this.taskListByDepartmentCount],
           backgroundColor: 'rgba(255, 99, 132, 0.8)', // Red
           borderColor: 'rgba(255, 99, 132, 1)',
           borderWidth: 3,
         },
       ]
       
     },
     options: {
       aspectRatio: 2,
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
           align:'center',
           labels: {
             usePointStyle: true,
             font: {
               size: 12,
             },
             padding: 16,
             pointStyle:'rectRounded',
         
           },
         },
         title: {
           display: true,
           text: 'Total task list for a department',
           font: {
             size: 14,
           },
         },
       },
     }
   });
 }

}

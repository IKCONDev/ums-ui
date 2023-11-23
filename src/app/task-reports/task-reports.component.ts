import { Component, Output } from '@angular/core';
import { OnInit } from '@angular/core';

import { BatchDetails } from '../model/BatchDetails.model';
import { Chart } from 'chart.js';
import { DepartmentService } from '../department/service/department.service';
import { Department } from '../model/Department.model';
import { Task } from '../model/Task.model';
import { HeaderService } from '../header/service/header.service';
import { Users } from '../model/Users.model';
import { MeetingService } from '../meetings/service/meetings.service';
import { TaskReportService } from './service/task-reports.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-report',
  templateUrl: './task-reports.component.html',
  styleUrls: ['./task-reports.component.css']
})
export class TaskReportsComponent implements OnInit {
  reportType: string;
  @Output() title = 'Task Reports'
  batchDetails: BatchDetails[];
  departmentList: Department[];
  umsUsersList: string[];
  selectedDepartment: number;
  selectedTaskOwner: string;
  selectedTaskSeverity: string = 'High';
  selectedTaskStatus: string = 'Yet to start';
  

  taskList: Task[];
  taskListCount :any[]= [];
  taskListChart = null;

  taskListByDepartmentCount = 0;
  taskListByDepartment: Task[];
  taskListByDepartmentChart = null;

  taskListByTaskOwnerCount = 0;
  taskListByTaskOwner: Task[];
  taskListByTaskOwnerChart = null;

  taskListByTaskSeverityCount = 0;
  taskListByTaskSeverity: Task[];
  taskListByTaskSeverityChart = null;

  taskListByTaskStatusCount = 0;
  taskListByTaskStatus: Task[];
  taskListByTaskStatusChart = null;

  agedTaskListCount= 0;
  agedTaskList: Task[];
  agedTaskListChart = null;

  defaultDepartment: number;
  

  loggedInUser = localStorage.getItem('email');

  /**
   * 
   * @param reportservice 
   */
  constructor(private taskreportsService: TaskReportService,
    private activatedRoute: ActivatedRoute,
    private departmentService: DepartmentService,
    private headerService: HeaderService,
    private meetingService: MeetingService) { 
      this.activatedRoute.queryParams.subscribe(param => {
        this.reportType = param['reportType'];
        console.log(this.reportType)
      })
    }

  /**
   * 
   */
  ngOnInit(): void {
    //get batch process details
    this.taskreportsService.getAllBatchProcessDetails().subscribe(
      res => {
        this.batchDetails = res.body;
        console.log(this.batchDetails);
        this.batchDetails.filter(batchDetail => {

        })
      });

    this.getLoggedInUserDetails(this.loggedInUser);
    //get active users list
    this.getActiveUsersList();
    this.getDepartments();
    this.selectedTaskOwner = this.loggedInUser;
    if(this.taskListChart === null){
      this.getTasks();
    }
    if(this.taskListByTaskOwnerChart === null){
      this.chooseUser();
    }
    if(this.taskListByTaskStatusChart === null){
      this.chooseStatus();
    }
    if(this.taskListByTaskSeverityChart === null){
      this.chooseSeverity();
    }
    if(this.agedTaskListChart === null){
      this.getAgedTasks();
    }
    //if(this.taskListByDepartmentChart === null){
      this.chooseDepartment();
    //}
    console.log('finished')
    
  }

  getDepartments(){
    this.departmentService.getDepartmentList().subscribe({
      next: response => {
        this.departmentList = response.body;
        console.log(this.departmentList)
      }
    })
  }

  userDetaiils: Users
  getLoggedInUserDetails(loggedInUser: string) {
    this.headerService.fetchUserProfile(loggedInUser).subscribe({
      next: response => {
        this.userDetaiils = response.body;
        this.defaultDepartment = response.body.employee.department.departmentId;
      }
    })
  }

  getTasks() {
    const startDate=new Date();
        const endDate=new Date();
        //add dynamic year
        startDate.setFullYear(new Date().getFullYear(),0,1);
        startDate.setHours(0,0,0,0);
        endDate.setFullYear(new Date().getFullYear(),11,31);
        endDate.setHours(23,59,59,999);
        console.log(startDate);
        console.log(endDate);
      this.taskreportsService.findAllTasks(startDate.toISOString(),endDate.toISOString()).subscribe({
      next: response => {
        console.log(response)
        this.taskListCount = response.body;
        console.log(this.taskListCount)
        if(this.taskListChart != null){
          this.taskListChart.destroy();
        }
        setTimeout(() => {
          this.createTaskListChart();
        },200)
      }
    })
  }

  createTaskListChart() {
    this.taskListChart = new Chart("taskListChart", {
      type: 'bar',
      data: {// values on X-Axis
        xLabels: ['Jan','Feb','Mar' ,'Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
	       datasets: [
          {
            label: "Total Tasks",
            data: this.taskListCount,
            backgroundColor: 'rgba(255, 99, 132, 0.8)', // Red
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 3,
          },
        ]
        
      },
      options: {
        aspectRatio: 1.7,
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
            text: 'Task Status of current Year',
            align:'center',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  
}

  getTasksByDepartment(selectedDepartment: number) {
    this.taskreportsService.findAllTasksByDepartment(selectedDepartment).subscribe({
      next: response => {
        this.taskListByDepartment = response.body;
        this.taskListByDepartmentCount = response.body.length;
        console.log(response.body)
      }
    })
  }

  chooseDepartment() {
    console.log(this.selectedDepartment)
    if (this.taskListByDepartmentChart != null) {
      this.taskListByDepartmentChart.destroy();
    }
    this.getTasksByDepartment(this.selectedDepartment !=0 ? this.selectedDepartment : this.defaultDepartment);
    setTimeout(() => {
      this.createTaskListByDepartmentChart();
    }, 500)

  }

  createTaskListByDepartmentChart() {
    this.taskListByDepartmentChart = new Chart("taskListByDepartmentChart", {
      type: 'doughnut',
      data: {// values on X-Axis
        xLabels: ['Total tasks'],
        datasets: [
          {
            label: "Total Tasks of a department",
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
            text: 'Total task list for a department',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }

  getTasksByTaskOwner(selectedTaskOwner: string) {
    this.taskreportsService.findAllTasksByTaskOwner(selectedTaskOwner).subscribe({
      next: response => {
        this.taskListByTaskOwner = response.body;
        console.log(this.taskListByTaskOwner)
        this.taskListByTaskOwnerCount = response.body.length;
      }
    });
  }

  getActiveUsersList() {
    this.meetingService.getActiveUserEmailIdList().subscribe({
      next: response => {
        this.umsUsersList = response.body;
        console.log(this.umsUsersList)
      }
    })
  }

  chooseUser() {
    if (this.taskListByTaskOwnerChart != null) {
      this.taskListByTaskOwnerChart.destroy();
    }
    this.getTasksByTaskOwner(this.selectedTaskOwner);
    setTimeout(() => {
      this.createTaskListByTaskOwnerChart();
    }, 500)
  }

  createTaskListByTaskOwnerChart() {
    this.taskListByTaskOwnerChart = new Chart("taskListByTaskOwnerChart", {
      type: 'polarArea',
      data: {// values on X-Axis
        xLabels: ['Total tasks'],
        datasets: [
          {
            label: "Total Task of a task owner",
            data: [this.taskListByTaskOwnerCount],
            backgroundColor: 'rgba(0, 201 , 255, 0.8)', // Red
            borderColor: 'rgba(0, 201, 255, 1)',
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
            text: 'Total task list for a task  owner',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }

  getTasksByTaskSeverity(severity: string) {
    this.taskreportsService.findAllTasksByTaskSeverity(severity).subscribe({
      next: response => {
        this.taskListByTaskSeverity = response.body;
        this.taskListByTaskSeverityCount = response.body.length;
        console.log(this.taskListByTaskSeverityCount)
      }
    })
  }

  chooseSeverity() {
    if (this.taskListByTaskSeverityChart != null) {
      this.taskListByTaskSeverityChart.destroy();
    }
    console.log(this.selectedTaskSeverity)
    this.getTasksByTaskSeverity(this.selectedTaskSeverity);
    setTimeout(() => {
      this.createTaskListByTaskSeverityChart();
    }, 500)
  }

  createTaskListByTaskSeverityChart() {
    this.taskListByTaskSeverityChart = new Chart("taskListByTaskSeverityChart", {
      type: 'pie',
      data: {// values on X-Axis
        xLabels: ['Total tasks'],
        datasets: [
          {
            label: "Total Tasks by severity level",
            data: [this.taskListByTaskSeverityCount],
            backgroundColor: 'rgba(245, 40, 145, 0.8)', // Red
            borderColor: 'rgba(245, 40, 145, 1)',
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
            text: 'Total task list by severity',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }

  getTasksByTaskStatus(taskStatus: string) {
    this.taskreportsService.findAllTasksByTaskStatus(taskStatus).subscribe({
      next: response => {
        this.taskListByTaskStatus = response.body;
        this.taskListByTaskStatusCount = response.body.length;
        console.log(this.taskListByTaskStatus)
        console.log(this.taskListByTaskStatusCount)
      }
    })
  }

  chooseStatus() {
    if (this.taskListByTaskStatusChart != null) {
      this.taskListByTaskStatusChart.destroy();
    }
    this.getTasksByTaskStatus(this.selectedTaskStatus);
    setTimeout(() => {
      this.createTaskListByTaskStatusChart();
    }, 500)
  }

  createTaskListByTaskStatusChart() {
    this.taskListByTaskStatusChart = new Chart("taskListByTaskStatusChart", {
      type: 'bar',
      data: {// values on X-Axis
        xLabels: ['Total tasks'],
        datasets: [
          {
            label: "Total Tasks by status",
            data: [this.taskListByTaskStatusCount],
            backgroundColor: 'rgba(216, 175, 53, 0.8)', // Yellow
            borderColor: 'rgba(216, 175, 53, 1)',
            borderWidth: 3,
          },
        ]
      },
      options: {
        animations: {
          tension: {
            duration: 1000,
            easing: 'easeOutExpo',
            from: 1,
            to: 0,
            loop: true
          }
        },
        aspectRatio: 2,
        scales: {
          x: {
            display: true,
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: false,
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
            text: 'Total task list by status',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }

  
  getAgedTasks(){
    var currentDate = new Date();
    // Extract the date part without the time
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth() + 1; // Months are zero-based
    var day = currentDate.getDate();

   // Format the date as a string (optional)
    var formattedDate = year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;
    console.log(formattedDate)
    this.taskreportsService.findAllAgedTasks(formattedDate).subscribe({
      next: response => {
        this.agedTaskList = response.body;
        this.agedTaskListCount = response.body.length;
        console.log(response.body)
        setTimeout(() => {
          this.createAgedTaskListChart();
        },300)
      }
    })
  }

  //AGED TASK CHART
  createAgedTaskListChart() {
    this.agedTaskListChart = new Chart("taskListByAge", {
      type: 'doughnut',
      data: {// values on X-Axis
        xLabels: ['Total tasks'],
        datasets: [
          {
            label: "Aged Tasks",
            data: [this.agedTaskListCount],
            backgroundColor: 'rgba(198, 59, 24, 0.8)', // Yellow
            borderColor: 'rgba(198, 59, 24, 1)',
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
            beginAtZero: false,
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
            text: 'Total task list by age',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }


}
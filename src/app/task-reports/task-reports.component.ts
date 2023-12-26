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
import { ActivatedRoute, Router } from '@angular/router';
import { HttpStatusCode } from '@angular/common/http';
import { error } from 'jquery';
import { DepartmentCount } from '../model/DepartmentCount.model';
import { TaskService } from '../task/service/task.service';
import { MenuItem } from '../model/MenuItem.model';
import { lastValueFrom } from 'rxjs';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';

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
  selectedDepartment: string;
  selectedTaskOwner: string;
  selectedTaskSeverity: string = 'High';
  selectedTaskStatus: string = 'Yet to start';


  taskList: Task[];
  taskListCount: any[] = [];
  taskListChart = null;

  taskListByDepartmentCount = 0;
  taskListByDepartment: Task[];
  taskListByDepartmentChart = null;
  taskListByDepartmentChart1 = null;

  taskListByTaskOwnerCount = 0;
  taskListByTaskOwner: Task[];
  taskListByTaskOwnerChart = null;

  taskListByTaskSeverityCount = 0;
  taskListByTaskSeverity: Task[];
  taskListByTaskSeverityChart = null;

  taskListByTaskStatusCount = 0;
  taskListByTaskStatus: Task[];
  taskListByTaskStatusChart = null;

  agedTaskListCount = 0;
  agedTaskList: Task[];
  agedTaskListChart = null;

  defaultDepartment: number;
  loggedInUser = localStorage.getItem('email');

  viewPermission: boolean;
  createPermission: boolean;
  updatePermission: boolean;
  deletePermission: boolean;
  noPermissions: boolean;
  userRoleMenuItemsPermissionMap: Map<string, string>

  /**
   * 
   * @param reportservice 
   */
  constructor(private taskreportsService: TaskReportService,
    private activatedRoute: ActivatedRoute,
    private departmentService: DepartmentService,
    private headerService: HeaderService,
    private meetingService: MeetingService,
    private router: Router, private taskService: TaskService,
    private menuItemService: AppMenuItemService) {
    this.activatedRoute.queryParams.subscribe(param => {
      this.reportType = param['reportType'];
      console.log(this.reportType)
    })
  }

  /**
   * 
   */
  loggedInUserPrincipalObject: Users;
  async ngOnInit(): Promise<void> {
    if(localStorage.getItem('jwtToken') === null){
      this.router.navigateByUrl('/session-timeout');
      return;
    }
    
    if (localStorage.getItem('userRoleMenuItemPermissionMap') != null) {
      this.userRoleMenuItemsPermissionMap = new Map(Object.entries(JSON.parse(localStorage.getItem('userRoleMenuItemPermissionMap'))));
    }
    //get menu item  details of home page
    var currentMenuItem = await this.getCurrentMenuItemDetails();
    console.log(currentMenuItem)

      if (this.userRoleMenuItemsPermissionMap.has(currentMenuItem.menuItemId.toString().trim())) {
        //this.noPermissions = false;
        //provide permission to access this component for the logged in user if view permission exists
        console.log('exe')
        //get permissions of this component for the user
        var menuItemPermissions = this.userRoleMenuItemsPermissionMap.get(this.currentMenuItem.menuItemId.toString().trim());
        if (menuItemPermissions.includes('View')) {
          this.viewPermission = true;
          //get logged in user details
          this.getLoggedInUserDetails(this.loggedInUser);
    //get active users list
    this.getActiveUsersList();
    this.getDepartments();
    this.getAllTasksByDepartment();
    this.selectedTaskOwner = this.loggedInUser;
    // if(this.reportType === null){
    //   this.getTasks();
    // }
    setTimeout(() => {
      if (this.reportType === 'organized') {
        this.chooseUser();
      }
      if (this.reportType === 'status') {
        this.chooseStatus();
      }
      if (this.reportType === 'severity') {
        this.chooseSeverity();
      }
      if (this.reportType === 'aged') {
        this.getAgedTasks();
      }
      if (this.reportType === 'department') {
        this.chooseDepartment();
      }
      if (this.reportType === 'all') {
        this.getAllDepartmentsCount();
        this.getAllDepartmentNames();
        this.createTaskListAllDepartmentChart()
      }
    }, 400)
        }else{
          this.viewPermission = false;
        }
        if (menuItemPermissions.includes('Create')) {
          this.createPermission = true;
        }else{
          this.createPermission = false;
        }
        if (menuItemPermissions.includes('Update')) {
          this.updatePermission = true;
        }else{
          this.updatePermission = false;
        }
        if (menuItemPermissions.includes('Delete')) {
          this.deletePermission = true;
        }else{
          this.deletePermission = false;
        }
      }else{
        //this.noPermissions = true;
        this.router.navigateByUrl('/unauthorized');
      }
  }

  getDepartments() {
    this.departmentService.getDepartmentList().subscribe({
      next: response => {
        this.departmentList = response.body;
        console.log(this.departmentList)
      }, error: error => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl('/session-timeout')
        }
      }
    })
  }

  departmentName: string;
  department: Department;
  getDepartmentById(selectedDepartmentId: number) {
    this.departmentService.getDepartment(selectedDepartmentId).subscribe({
      next: response => {
        if (response.status === HttpStatusCode.Ok) {
          this.department = response.body
          this.departmentName = this.department.departmentName;
        }
      }, error: error => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl('/session-timeout')
        }
      }
    })
  }


  getLoggedInUserDetails(loggedInUser: string) {
    this.headerService.fetchUserProfile(loggedInUser).subscribe({
      next: response => {
        this.loggedInUserPrincipalObject = response.body;
        //this.selectedDepartment = this.loggedInUserPrincipalObject.employee.department.departmentId.toString();
        this.departmentName = this.loggedInUserPrincipalObject.employee.department.departmentName;
      }, error: error => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl('/session-timeout')
        }
      }
    })
  }

  // getTasks() {
  //   const startDate=new Date();
  //       const endDate=new Date();
  //       //add dynamic year
  //       startDate.setFullYear(new Date().getFullYear(),0,1);
  //       startDate.setHours(0,0,0,0);
  //       endDate.setFullYear(new Date().getFullYear(),11,31);
  //       endDate.setHours(23,59,59,999);
  //       console.log(startDate);
  //       console.log(endDate);
  //     this.taskreportsService.findAllTasks(startDate.toISOString(),endDate.toISOString()).subscribe({
  //     next: response => {
  //       console.log(response)
  //       this.taskListCount = response.body;
  //       console.log(this.taskListCount)
  //       if(this.taskListChart != null){
  //         this.taskListChart.destroy();
  //       }
  //       setTimeout(() => {
  //         this.createTaskListChart();
  //       },200)
  //     }, error: error => {
  //       if(error.status === HttpStatusCode.Unauthorized){
  //         this.router.navigateByUrl('/session-timeout')
  //       }
  //     }
  //   })
  // }

  //   createTaskListChart() {
  //     this.taskListChart = new Chart("taskListChart", {
  //       type: 'bar',
  //       data: {// values on X-Axis
  //         xLabels: ['Jan','Feb','Mar' ,'Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  // 	       datasets: [
  //           {
  //             label: "Total Tasks",
  //             data: this.taskListCount,
  //             backgroundColor: 'rgba(255, 99, 132, 0.8)', // Red
  //             borderColor: 'rgba(255, 99, 132, 1)',
  //             borderWidth: 3,
  //           },
  //         ]

  //       },
  //       options: {
  //         aspectRatio: 1.7,
  //         scales: {
  //           x: {
  //             display: true,
  //             grid: {
  //               display: false,
  //             },
  //           },
  //           y: {
  //             display: true,
  //             grid: {
  //               display: true,
  //             },
  //           },
  //         },
  //         plugins: {
  //           legend: {
  //             display: true,
  //             position: 'top',
  //             align:'center',
  //             labels: {
  //               usePointStyle: true,
  //               font: {
  //                 size: 12,
  //               },
  //               padding: 16,
  //               pointStyle:'rectRounded',

  //             },
  //           },
  //           title: {
  //             display: true,
  //             text: 'Task Status of current Year',
  //             align:'center',
  //             font: {
  //               size: 14,
  //             },
  //           },
  //         },
  //       }
  //     });

  // }

  getTasksByDepartment(selectedDepartment: number) {
    if (selectedDepartment != null) {
      console.log(selectedDepartment)
      this.taskreportsService.findAllTasksByDepartment(selectedDepartment).subscribe({
        next: response => {
          this.taskListByDepartment = response.body;
          this.taskListByDepartmentCount = response.body.length;
          console.log(response.body)
          setTimeout(() => {
            this.createTaskListByDepartmentChart();
          }, 400)
        }
      })
    }
  }

  chooseDepartment() {
    console.log(this.selectedDepartment)
    if (this.taskListByDepartmentChart != null) {
      this.taskListByDepartmentChart.destroy();
      this.getDepartmentById(parseInt(this.selectedDepartment));
    }
    this.getTasksByDepartment(parseInt(this.selectedDepartment));
  }
  taskListByDepartmentData:any[];
  xlabelsForTaskListByDepartment:any[];
  createTaskListByDepartmentChart() {
    if(this.ChartType==='line'){
        this.taskListByDepartmentData=[0,this.taskListByDepartmentCount,];
        this.xlabelsForTaskListByDepartment=['','Total tasks','']
    }else{
      this.taskListByDepartmentData=[this.taskListByDepartmentCount];
      this.xlabelsForTaskListByDepartment=['Total tasks'];
    }
    this.taskListByDepartmentChart = new Chart("taskListByDepartmentChart", {
      type: this.ChartType,
      data: {// values on X-Axis
        xLabels: this.xlabelsForTaskListByDepartment,
        datasets: [
          {
            label: "Total Tasks of a department",
            data: this.taskListByDepartmentData,
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
            beginAtZero:true,
            min:0,
            display: true,
            grid: {
              display: true,
            },
            ticks: {
              stepSize: 1,
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

  taskListByTaskOwnerData:any[];
  xLabelForTaskListByTaskOwner:any[];
  createTaskListByTaskOwnerChart() {
    if(this.ChartType==='line'){
      this.taskListByTaskOwnerData=[0,this.taskListByTaskOwnerCount,];
      this.xLabelForTaskListByTaskOwner=['','Total tasks','']
  }else{
    this.taskListByTaskOwnerData=[this.taskListByTaskOwnerCount];
    this.xLabelForTaskListByTaskOwner=['Total tasks'];
  }
    this.taskListByTaskOwnerChart = new Chart("taskListByTaskOwnerChart", {
      type: this.ChartType,
      data: {// values on X-Axis
        xLabels: this.xLabelForTaskListByTaskOwner,
        datasets: [
          {
            label: "Total tasks of a task owner",
            data:  this.taskListByTaskOwnerData,
            backgroundColor: 'rgba(159, 134, 105, 0.8)', // Dark blue
            borderColor: 'rgba(159, 134, 105, 1)',
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
            beginAtZero:true,
            min:0,
            display: true,
            grid: {
              display: true,
            },
            ticks: {
              stepSize: 1,
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


  taskListByTaskSeverityData:any[];
  xLabelByTaskSeverity:any[];
  createTaskListByTaskSeverityChart() {
    if(this.ChartType==='line'){
      this.taskListByTaskSeverityData=[0,this.taskListByTaskSeverityCount,];
      this.xLabelByTaskSeverity=['','Total tasks','']
  }else{
    this.taskListByTaskSeverityData=[this.taskListByTaskSeverityCount];
    this.xLabelByTaskSeverity=['Total tasks'];
  }
    this.taskListByTaskSeverityChart = new Chart("taskListByTaskSeverityChart", {
      type: this.ChartType,
      data: {// values on X-Axis
        xLabels: this.xLabelByTaskSeverity,
        datasets: [
          {
            label: "Total Tasks by severity level",
            data: this.taskListByTaskSeverityData,
            backgroundColor: 'rgba(37, 128, 101, 0.8)', // Dark Green
            borderColor: 'rgba(37, 128, 101, 1)',
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
            beginAtZero:true,
            min:0,
            display: true,
            grid: {
              display: true,
            },
            ticks: {
              stepSize: 1,
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

  taskListByTaskStatusData:any[];
  xLabelsForTaskListStatus:any[];
  createTaskListByTaskStatusChart() {
    if(this.ChartType==='line'){
      this.taskListByTaskStatusData=[0,this.taskListByTaskStatusCount,];
      this.xLabelsForTaskListStatus=['','Total tasks','']
  }else{
    this.taskListByTaskStatusData=[this.taskListByTaskStatusCount];
    this.xLabelsForTaskListStatus=['Total tasks'];
  }
    this.taskListByTaskStatusChart = new Chart("taskListByTaskStatusChart", {
      type: this.ChartType,
      data: {// values on X-Axis
        xLabels: this.xLabelsForTaskListStatus,
        datasets: [
          {
            label: "Total Tasks by status",
            data: this.taskListByTaskStatusData,
            backgroundColor: 'rgba(31, 190, 189, 0.8)', // Dark Blue
            borderColor: 'rgba(31, 190, 189, 1)',
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
        aspectRatio: 2.2,
        scales: {
          x: {
            display: true,
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            min:0,
            display: true,
            grid: {
              display: true,
            },
            ticks: {
              stepSize: 1,
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


  getAgedTasks() {
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
        }, 300)
      }
    })
  }

  //AGED TASK CHART

  agedTaskListData:any[];
  xLabelsTaskListData:any[];
  createAgedTaskListChart() {
    if(this.ChartType==='line'){
      this.agedTaskListData=[0,this.agedTaskListCount,];
      this.xLabelsTaskListData=['','Total tasks','']
  }else{
    this.agedTaskListData=[this.agedTaskListCount];
    this.xLabelsTaskListData=['Total tasks'];
  }
    this.agedTaskListChart = new Chart("taskListByAge", {
      type: this.ChartType,
      data: {// values on X-Axis
        xLabels:  this.xLabelsTaskListData,
        datasets: [
          {
            label: "Aged Tasks",
            data:  this.agedTaskListData,
            backgroundColor: 'rgba(169, 180, 185, 0.8)', // grey
            borderColor: 'rgba(169, 180, 185, 1)',
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
            beginAtZero:true,
            min:0,
            display: true,
            grid: {
              display: true,
            },
            ticks: {
              stepSize: 1,
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

  //code for All Departments data

  deptMeetingCount: DepartmentCount[];
  deptValueCount: DepartmentCount[] = [];
  meetingDepartmentCount: string[];
  getAllDepartmentsCount() {
    this.taskreportsService.getAllDepartmentTasksCount().subscribe({
      next: response => {
        this.deptMeetingCount = response.body;
        // this.deptValueCount = new  DepartmentCount[this.deptMeetingCount.length];
        console.log(this.deptMeetingCount);
        var i = 0;
        this.deptMeetingCount.forEach(deptCount => {
          var deptCountString = (String)(deptCount);
          console.log(deptCountString)
          this.meetingDepartmentCount = deptCountString.split(',');
          console.log(this.meetingDepartmentCount)
          var deptObject = new DepartmentCount();
          deptObject.deptId = this.meetingDepartmentCount[0]
          deptObject.meetingCount = this.meetingDepartmentCount[1]
          this.deptValueCount.push(deptObject);
        })
        console.log(this.deptValueCount)
        this.getAllDepartmentNames()

      }
    })
  }
  deptValueCount1: DepartmentCount[] = [];
  getAllDepartmentNames() {
    //this.deptValueCount1 = new DepartmentCount[this.deptValueCount.length]
    this.getDepartments();
    this.departmentList.forEach(deptList => {
      console.log(deptList);
      this.deptValueCount.forEach(deptValue => {
        if (deptList.departmentId === parseInt(deptValue.deptId)) {
          deptValue.departmentName = deptList.departmentName;
          deptValue.departmentHead = deptList.departmentHead;
        }
      })

    })

  }
  alltaskList: Task[]
  alltasksCount: number;
  getAllTasksByDepartment() {
    this.taskService.getAlltasks().subscribe({
      next: response => {
        this.taskList = response.body;
        this.alltasksCount = response.body.length;
      }
    })
  }
  ChartType: any = 'line';
  colorOfChartType: any = 'line';
  setChartType(value: any) {
    this.ChartType = value;
    this.colorOfChartType = value;
    console.log(value)

    if (this.reportType === "department") {
      this.ChartType = value;
      if (this.taskListByDepartmentChart != null) {
        this.taskListByDepartmentChart.destroy();
        this.createTaskListByDepartmentChart();
      }
    }
    else if (this.reportType === "organized") {
      this.ChartType = value;
      if (this.taskListByTaskOwnerChart != null) {
        this.taskListByTaskOwnerChart.destroy();
        this.createTaskListByTaskOwnerChart();
      }
    }
    else if (this.reportType === "severity") {
      this.ChartType = value;
      if (this.taskListByTaskSeverityChart != null) {
        this.taskListByTaskSeverityChart.destroy();
        this.createTaskListByTaskSeverityChart();
      }
    }

    else if (this.reportType === "status") {
      this.ChartType = value;
      if (this.taskListByTaskStatusChart != null) {
        this.taskListByTaskStatusChart.destroy();
        this.createTaskListByTaskStatusChart();
      }
    }
    else if (this.reportType === "aged") {
      this.ChartType = value;
      if (this.agedTaskListChart != null) {
        this.agedTaskListChart.destroy();
        this.createAgedTaskListChart();
      }
    }
    else if (this.reportType === "all" && this.selectedDepartment != null) {
      this.ChartType = value;
      if (this.taskListByDepartmentChart != null) {
        this.taskListByDepartmentChart.destroy();
        this.createTaskListByDepartmentChart();
      }
    }
    else if (this.reportType === "all") {
      this.ChartType = value;
      console.log("department is null")
      if (this.taskListByDepartmentChart != null) {
        this.taskListByDepartmentChart.destroy();
        
      }
      this.createTaskListAllDepartmentChart();
      
      
    }

  }
  
  taskListAllDepartmentData:any[];
  xLabelForTaskListAllDepartrment:any[];
  createTaskListAllDepartmentChart() {
    if(this.ChartType==='line'){
      this.taskListAllDepartmentData=[0,this.alltasksCount,];
      this.xLabelForTaskListAllDepartrment=['','Total tasks','']
  }else{
    this.taskListAllDepartmentData=[this.alltasksCount];
    this.xLabelForTaskListAllDepartrment=['Total tasks'];
  }
    this.taskListByDepartmentChart = new Chart("taskListByDepartmentChart", {
      type: this.ChartType,
      data: {// values on X-Axis
        xLabels: this.xLabelForTaskListAllDepartrment,
        datasets: [
          {
            label: "Total task list of all departments",
            data:this.taskListAllDepartmentData,
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
            beginAtZero:true,
            min:0,
            display: true,
            grid: {
              display: true,
            },
            ticks: {
              stepSize: 1,
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
            text: 'Total task list of all departments',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }

  currentMenuItem: MenuItem;
  async getCurrentMenuItemDetails(): Promise<MenuItem> {
    const response = await lastValueFrom(this.menuItemService.findMenuItemByName('Task Reports')).then(response => {
      if (response.status === HttpStatusCode.Ok) {
        this.currentMenuItem = response.body;
        console.log(this.currentMenuItem)
      } else if (response.status === HttpStatusCode.Unauthorized) {
        console.log('eit')
        this.router.navigateByUrl('/session-timeout');
      }
    }, reason => {
      if (reason.status === HttpStatusCode.Unauthorized) {
        this.router.navigateByUrl('/session-timeout')
      }
    }
    )
    console.log(this.currentMenuItem);
    return this.currentMenuItem;
  }

}

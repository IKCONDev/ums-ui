import { Component, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Department } from '../model/Department.model';
import { DepartmentService } from '../department/service/department.service';
import { HttpStatusCode } from '@angular/common/http';
import { error } from 'jquery';
import { ActionItemsReportsService } from './service/action-item-reports.service';
import { ActionItems } from '../model/Actionitem.model';
import { EmployeeService } from '../employee/service/employee.service';
import { Employee } from '../model/Employee.model';
import { Chart } from 'chart.js';
import { HeaderService } from '../header/service/header.service';
import { Users } from '../model/Users.model';
import { DepartmentCount } from '../model/DepartmentCount.model';
import { ActionService } from '../action-item/service/action.service';

@Component({
  selector: 'app-action-item-reports',
  templateUrl: './action-item-reports.component.html',
  styleUrls: ['./action-item-reports.component.css']
})
export class ActionItemsReportsComponent implements OnInit {
  reportType: string;
  @Output() title = 'Action Item Reports'

  loggedInUserId: string = localStorage.getItem('email');

  departmentList: Department[];

  selectedDepartment: string;
  selectedDepartmentName: string;
  selectedUser: string;

  actionItemsByDepartmentReportChart =  null;


  constructor(private activatedRoute:ActivatedRoute, private deprtmentService: DepartmentService,
    private router: Router, private actionItemsReportService: ActionItemsReportsService, 
    private employeeService: EmployeeService, private headerService: HeaderService, 
    private departmentService: DepartmentService, private actionService:ActionService){
    this.activatedRoute.queryParams.subscribe(param => {
      this.reportType = param['reportType'];
      console.log(this.reportType)
    }) 
  }

  selectedUserFullName: string;
  loggedInUserPrincipalObject: Users;
  ngOnInit(): void {
    this.headerService.fetchUserProfile(this.loggedInUserId).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.loggedInUserPrincipalObject = response.body;
          this.selectedUser = this.loggedInUserPrincipalObject.email;
          //this.selectedDepartment = this.loggedInUserPrincipalObject.employee.department.departmentId.toString();
          this.selectedDepartmentName = this.loggedInUserPrincipalObject.employee.department.departmentName;
          this.selectedPriority = 'High';
        }
      }
    })
    setTimeout(() => {
       //initialize data
      this.getAllDepartments();
      this.getEmployeeAsUserList();
      this.getAllActionItemsCount();
      if(this.reportType === 'department'){
        this.chooseDepartment();
      }
      if(this.reportType === 'organized'){
        this.chooseUser();
      }
      if(this.reportType === 'priority'){
        this.choosePriority();
      }
      if(this.reportType === 'all'){
        this.getAllDepartmentsCount();
        this.getAllDepartmentNames();
      }
    },200)
    
  }

  department: Department;
  getDepartment(){
    this.departmentService.getDepartment(parseInt(this.selectedDepartment)).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.department = response.body;
          this.selectedDepartmentName = this.department.departmentName;
        }
      }
    })
  }

  getUserDetails(){
    this.headerService.fetchUserProfile(this.selectedUser).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.loggedInUserPrincipalObject = response.body;
          this.selectedUserFullName = this.loggedInUserPrincipalObject.employee.firstName+" "+this.loggedInUserPrincipalObject.employee.lastName;
          console.log(this.selectedUserFullName)
        }
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      }
    })
  }

  employeeListAsUser: Employee[];
  getEmployeeAsUserList(){
    this.employeeService.getUserStatusEmployees(true).subscribe({
      next: response => {
        this.employeeListAsUser = response.body;
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }
      }
    })
  }

  getAllDepartments(){
    this.deprtmentService.getDepartmentList().subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.departmentList = response.body;
        }
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }
      }
    })
  }


  actionItemListOfOrganizer: ActionItems[]
  actionItemsCountOforganizer: number = 0;
  getActionItemsReportOfUser(selectedUser: string){
    this.actionItemsReportService.findOrganizedActionItemsReportByUserId(selectedUser).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.actionItemListOfOrganizer = response.body;
          this.actionItemsCountOforganizer = response.body.length;
          this.getUserDetails();
          setTimeout(() => {
            this.createActionItemsOfOrganizerReportChart();
          },400)
        }
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      }
    })
  }

  actionItemListByDepartment: ActionItems[]
  actionItemsCountOfDepartment: number = 0;
  getActionItemsReportByDepartment(selectedDepartment: string){
    this.actionItemsReportService.findActionItemsReportByDepartment(parseInt(selectedDepartment)).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.actionItemListByDepartment = response.body;
          this.actionItemsCountOfDepartment = response.body.length;
          this.getDepartment();
          setTimeout(() => {
            this.createActionItemsByDepartmentReportChart();
          },400)
        }
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      }
    })
  }

  selectedPriority: string = 'High';
  actionItemListByPriority: ActionItems[];
  actionItemsCountByPriority: number = 0;
  getActionItemsReportByPriority(selectedPriority: string){
    this.actionItemsReportService.findActionItemsReportByPriority(selectedPriority).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.actionItemListByPriority = response.body;
          this.actionItemsCountByPriority = response.body.length;
          setTimeout(() => {
            this.createActionItemsByPriorityReportChart();
          },400)
        }
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      }
    })
  }

  chooseDepartment(){
    if(this.actionItemsByDepartmentReportChart != null){
      this.actionItemsByDepartmentReportChart.destroy();
    }
    this.getActionItemsReportByDepartment(this.selectedDepartment)
  }

  actionItemsByPriorityReportChart = null;

  choosePriority(){
    if(this.actionItemsByPriorityReportChart != null){
      this.actionItemsByPriorityReportChart.destroy();
    }
    this.getActionItemsReportByPriority(this.selectedPriority);
  }

  createActionItemsByPriorityReportChart(){
    this.actionItemsByPriorityReportChart = new Chart("actionItemsByPriorityReportChart", {
      type: 'pie',
      data: {// values on X-Axis
        xLabels: ['Total Action items of  priority'],
        datasets: [
          {
            label: "Total Action items of  priority",
            data: [this.actionItemsCountByPriority],
            backgroundColor: 'rgba(175, 136, 245, 0.8)', // violet
            borderColor: 'rgba(175, 136, 245, 1)',
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
        aspectRatio: 2.3,
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
            ticks:{
              stepSize :1
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
            text: 'Total Action items of priority',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }

  createActionItemsByDepartmentReportChart(){
    this.actionItemsByDepartmentReportChart = new Chart("actionItemsByDepartmentReportChart", {
      type: 'pie',
      data: {// values on X-Axis
        xLabels: ['Total Action items of a department'],
        datasets: [
          {
            label: "Total Action items of a department",
            data: [this.actionItemsCountOfDepartment],
            backgroundColor: 'rgba(175, 136, 245, 0.8)', // violet
            borderColor: 'rgba(175, 136, 245, 1)',
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
        aspectRatio: 2.3,
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
            ticks:{
              stepSize :1
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
            text: 'Total Action items of a department',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }

  chooseUser(){
    if(this.actionItemsByOrganizerReportChart != null){
      this.actionItemsByOrganizerReportChart.destroy();
    }
    this.getActionItemsReportOfUser(this.selectedUser);
  }

  actionItemsByOrganizerReportChart = null;
  createActionItemsOfOrganizerReportChart(){
    this.actionItemsByOrganizerReportChart = new Chart("actionItemsByOrganizerReportChart", {
      type: 'bar',
      data: {// values on X-Axis
        xLabels: ['Total Action items of a organizer'],
        datasets: [
          {
            label: "Total Action items of a organizer",
            data: [this.actionItemsCountOforganizer],
            backgroundColor: 'rgba(1255, 106, 149, 0.8)', // violet
            borderColor: 'rgba(255, 106, 149, 1)',
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
        aspectRatio: 2.3,
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
            ticks:{
              stepSize :1
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
            text: 'Total Action items of a organizer',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }
  
  //Action Items By Department Count
 deptMeetingCount : DepartmentCount[];
deptValueCount : DepartmentCount[] = [];
 meetingDepartmentCount : string[];
  getAllDepartmentsCount(){
    this.actionItemsReportService.getAllDepartmentActionItemsCount().subscribe({
       next : response =>{
         this.deptMeetingCount = response.body;
        // this.deptValueCount = new  DepartmentCount[this.deptMeetingCount.length];
         console.log(this.deptMeetingCount);
         var i =0;
         this.deptMeetingCount.forEach(deptCount =>{
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
  deptValueCount1 : DepartmentCount[] = [];
  getAllDepartmentNames(){
     this.getAllDepartments();
     //this.deptValueCount1 = new DepartmentCount[this.deptValueCount.length]
     this.departmentList.forEach(deptList =>{
      console.log(deptList);
       this.deptValueCount.forEach(deptValue=>{
         if(deptList.departmentId === parseInt(deptValue.deptId) ){
            deptValue.departmentName = deptList.departmentName;
            deptValue.departmentHead = deptList.departmentHead;
         }
       })

     })
    
  }
  allActionItemsCount : number;
  allActionItems : ActionItems[]
  getAllActionItemsCount(){
    this.actionService.getAllActionItems().subscribe({
       next : response =>{
         this.allActionItems= response.body;
         this.allActionItemsCount = response.body.length;

       }
    })
  }

}

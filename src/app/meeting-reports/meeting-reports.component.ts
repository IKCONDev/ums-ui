import { Component, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import * as d3 from 'd3';
import { MeetingReportsService } from './service/meeting-reports.service';
import { HttpStatusCode } from '@angular/common/http';
import { Meeting } from '../model/Meeting.model';
import { Chart } from 'chart.js';
import { Employee } from '../model/Employee.model';
import { EmployeeService } from '../employee/service/employee.service';
import { UserService } from '../users/service/users.service';
import { HeaderService } from '../header/service/header.service';
import { Users } from '../model/Users.model';
import { DepartmentService } from '../department/service/department.service';
import { Department } from '../model/Department.model';
import { error } from 'jquery';
import { DepartmentCount } from '../model/DepartmentCount.model';
import { MenuItem } from '../model/MenuItem.model';
import { lastValueFrom } from 'rxjs';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';

@Component({
  selector: 'app-meeting-reports',
  templateUrl: './meeting-reports.component.html',
  styleUrls: ['./meeting-reports.component.css']
})
export class MeetingReportsComponent implements OnInit {

  reportType: string;
  @Output() title = 'Meeting Reports'
 
  loggedInUser = localStorage.getItem('email');
  loggedInUserRole = localStorage.getItem('userRole');
  loggedInUserFullName = localStorage.getItem('firstName')+' '+localStorage.getItem('lastName');
  loggedInUserObject : Users;

  employeeListAsUser: Employee[];
  departmentList: Department[];
  deptMeetingCount :DepartmentCount[]

  selectedEmployee: string;
  selectedDepartment: string;
  selectedDepartmentName: string;
  selectedAttendeeUser: string;
  selectedDepartmentID: number;

  organizedMeetingList :Meeting[];
  organizedMeetingListCount: number
  organizedmeetingListChart = null;
  meetingsByDepartmentList :Meeting[];
  meetingsByDepartmentListCount: number
  meetingsByDepartmentListChart  = null;
  attendedMeetingList: Meeting[];
  attendedMeetingListCount: number;
  attendedMeetingListChart = null;

  viewPermission: boolean;
  createPermission: boolean;
  updatePermission: boolean;
  deletePermission: boolean;
  noPermissions: boolean;
  userRoleMenuItemsPermissionMap: Map<string, string>

  constructor(private router: Router, private activatedRoute: ActivatedRoute,
    private meetingReportService: MeetingReportsService,
    private employeeService: EmployeeService,
    private userService: UserService, 
    private headerService: HeaderService,
    private departmentService: DepartmentService,
    private menuItemService: AppMenuItemService) {

      //get current router param
    this.activatedRoute.queryParams.subscribe(param => {
      this.reportType = param['reportType'];
      console.log(this.reportType)
    })
  }

 async  ngOnInit(): Promise<void> {
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
    this.headerService.fetchUserProfile(this.loggedInUser).subscribe({
      next: response => {
        this.loggedInUserObject = response.body;
        this.selectedEmployee = this.loggedInUserObject.email;
        //this.selectedDepartment = this.loggedInUserObject.employee.department.departmentId.toString();
        this.selectedDepartmentName = this.loggedInUserObject.employee.department.departmentName;
        this.selectedAttendeeUser = this.loggedInUserObject.email;
        
        if(this.reportType === 'employee'){
          this.chooseEmployee();
        }
        if(this.reportType === 'department'){
          this.chooseDepartment();
        }
        if(this.reportType === 'attended'){
          this.chooseAttendedMeetingUser();
        }
      }
    })
    //initial data load
      this.getEmployeeAsUserList();      
      this.getAllDepartments();
      this.getAllMeetings();
      this.getAllDepartmentsCount();
      this.getAllDepartmentNames();
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

  getLoggedInUserDetails(loggedInUser: string){
    this.headerService.fetchUserProfile(this.loggedInUser).subscribe({
      next: response => {
        this.loggedInUserObject = response.body;
        this.selectedEmployee = this.loggedInUserObject.email;
        this.selectedDepartment = this.loggedInUserObject.employee.department.departmentId.toString();
        this.selectedDepartmentName = this.loggedInUserObject.employee.department.departmentName;
      }
    });
  }

  choosenDepartment: Department;
  getDepartmentById(id: number){
    this.departmentService.getDepartment(parseInt(this.selectedDepartment)).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.choosenDepartment = response.body;
          this.selectedDepartmentName = this.choosenDepartment.departmentName;
           this.selectedDepartmentID= this.choosenDepartment.departmentId;
          console.log(this.choosenDepartment)
        }
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      }
    })
  }

  getEmployeeAsUserList(){
    this.employeeService.getUserStatusEmployees(true).subscribe({
      next: response => {
        this.employeeListAsUser = response.body;
      }
    })
  }

  getAllDepartments(){
    this.departmentService.getDepartmentList().subscribe({
      next: response => {
        this.departmentList = response.body;
        console.log(response.body)
      }
    })
  }

  chooseEmployee(){
    if(this.organizedmeetingListChart != null){
      this.organizedmeetingListChart.destroy();
    }
    this.getMeetingsByOrganizerReport(this.selectedEmployee);
  }

  chooseDepartment(){
    if(this.meetingsByDepartmentListChart != null){
      this.meetingsByDepartmentListChart.destroy();
      //get department details
      this.getDepartmentById(parseInt(this.selectedDepartment))
    }
    this.getmeetingsByDepartmentReport(parseInt(this.selectedDepartment));
  }


  chooseAttendedMeetingUser(){
    if(this.attendedMeetingListChart != null){
      this.attendedMeetingListChart.destroy();
    }
    this.getAttendedMeetingsOfUserReport(this.selectedAttendeeUser);
  }

  getAttendedMeetingsOfUserReport(selectedAttendeeUser: string){
    this.meetingReportService.findMeetingsByAttendeeReport(selectedAttendeeUser).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.attendedMeetingList = response.body;
          this.attendedMeetingListCount = response.body.length;
          setTimeout(() => {
            this.createMeetingsByAttendeeReportChart();
          },400)
        }
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      }
    })
  }

  getmeetingsByDepartmentReport(departmentId: number){
    this.meetingReportService.findMeetingsByDepartmentReport(departmentId).subscribe({
      next: response => {
        this.meetingsByDepartmentList = response.body;
        this.meetingsByDepartmentListCount = response.body.length;
        setTimeout(() => {
          this.createMeetingsByDepartmentReportChart();
        },400)
      }
    })
  }

  getMeetingsByOrganizerReport(organizerEmail: string){
    this.meetingReportService.findMeetingsByOrganizerReport(organizerEmail).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.organizedMeetingList = response.body;
          this.organizedMeetingListCount = response.body.length;
          setTimeout(() => {
            this.createMeetingsByOrganizerReportChart();
          },400)
        }
      }
    })
  }

  createMeetingsByOrganizerReportChart(){
    this.organizedmeetingListChart = new Chart("organizedmeetingListChart", {
      type: this.type,
      data: {// values on X-Axis
        xLabels: ['Total meetings of an organizer'],
        datasets: [
          {
            label: "Total meetings by organizer",
            data: [this.organizedMeetingListCount],
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
            text: 'Total meetings by organizer',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }

  createMeetingsByDepartmentReportChart(){
    console.log(" draw chart")
    this.meetingsByDepartmentListChart = new Chart("meetingsByDepartmentListChart", {
      type: this.type,
      data: {// values on X-Axis
        xLabels: ['Total meetings of a department'],
        datasets: [
          {
            label: "Total meetings of a department",
           data: [this.meetingsByDepartmentListCount],
           //data: [this.OrganizedMeetingCount],
            backgroundColor: 'rgba(197, 14, 71, 0.8)', // Yellow
            borderColor: 'rgba(197, 14, 71, 1)',
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
            text: 'Total meetings of a department',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }

  createMeetingsByAttendeeReportChart(){
    this.attendedMeetingListChart = new Chart("attendedMeetingListChart", {
      type: this.type,
      data: {// values on X-Axis
        xLabels: ['Total meetings of an attendee'],
        datasets: [
          {
            label: "Total meetings of an attendee",
            data: [this.attendedMeetingListCount],
            backgroundColor: 'rgba(101, 200, 255, 0.8)', // Yellow
            borderColor: 'rgba(101, 200, 255, 1)',
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
            text: 'Total meetings of an attendee',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }

  

  // data = [
  //   { "Framework": "Vue", "Stars": "166443", "Released": "2014" },
  //   { "Framework": "React", "Stars": "150793", "Released": "2013" },
  //   { "Framework": "Angular", "Stars": "62342", "Released": "2016" },
  //   { "Framework": "Backbone", "Stars": "27647", "Released": "2010" },
  //   { "Framework": "Ember", "Stars": "21471", "Released": "2011" }
  // ]
  // private svg: any;
  // private margin = 50;
  // private width = 750 - (this.margin * 2);
  // private height = 400 - (this.margin * 2);

  // constructor(private router: Router, private activatedRoute: ActivatedRoute) {
  //   this.activatedRoute.queryParams.subscribe(param => {
  //     this.reportType = param['reportType'];
  //     console.log(this.reportType)
  //   })
  // }

  // ngOnInit(): void {
  //   this.createSvg();
  //   this.drawBars(this.data);
  // }

  // private createSvg(): void {
  //   this.svg = d3.select("figure#bar")
  //     .append("svg")
  //     .attr("width", this.width + (this.margin * 2))
  //     .attr("height", this.height + (this.margin * 2))
  //     .append("g")
  //     .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  // }

  // private drawBars(data: any[]): void {
  //   // Create the X-axis band scale
  //   const x = d3.scaleBand()
  //     .range([0, this.width])
  //     .domain(data.map(d => d.Framework))
  //     .padding(0.2);

  //   // Draw the X-axis on the DOM
  //   this.svg.append("g")
  //     .attr("transform", "translate(0," + this.height + ")")
  //     .call(d3.axisBottom(x))
  //     .selectAll("text")
  //     .attr("transform", "translate(-10,0)rotate(-45)")
  //     .style("text-anchor", "end");

  //   // Create the Y-axis band scale
  //   const y = d3.scaleLinear()
  //     .domain([0, 200000])
  //     .range([this.height, 0]);

  //   // Draw the Y-axis on the DOM
  //   this.svg.append("g")
  //     .call(d3.axisLeft(y));

  //   // Create and fill the bars
  //   this.svg.selectAll("bars")
  //     .data(data)
  //     .enter()
  //     .append("rect")
  //     .attr("x", (d: any) => x(d.Framework))
  //     .attr("y", (d: any) => y(d.Stars))
  //     .attr("width", x.bandwidth())
  //     .attr("height", (d: any) => this.height - y(d.Stars))
  //     .attr("fill", "#d04a35");
  // }
  OrganizedMeetingList : Meeting[]
  OrganizedMeetingCount : number;
  getAllMeetings(){
     this.meetingReportService.findAllMeetings().subscribe({ 
      next: response => {
        this.OrganizedMeetingList = response.body;
        console.log(this.OrganizedMeetingList);
        this.OrganizedMeetingCount = response.body.length;
        setTimeout(() => {
          //this.createMeetingsByDepartmentReportChart();
          this.createMeetingsByAllDepartmentReportChart();
        },400)
      }
    })
  }
 deptValueCount : DepartmentCount[] = [];
 meetingDepartmentCount : string[];
  getAllDepartmentsCount(){
    this.meetingReportService.getAllDepartmentMeetingsCount().subscribe({
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
  createMeetingsByAllDepartmentReportChart(){
    this.meetingsByDepartmentListChart = new Chart("meetingsByDepartmentListChart", {
      type: this.type,
      data: {// values on X-Axis
        xLabels: ['Total meetings of all departments'],
        datasets: [
          {
            label: "Total meetings of all departments",
            data: [this.OrganizedMeetingCount],
           //data: [this.OrganizedMeetingCount],
            backgroundColor: 'rgba(197, 14, 71, 0.8)', // Yellow
            borderColor: 'rgba(197, 14, 71, 1)',
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
            text: 'Total meetings of all departments',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }
  type : any = 'line'
  colorOfChartType: any = 'line';
  setChartType(value : any){
    this.type = value;
    console.log(this.type)
    if(this.reportType =='all' ){
      this.colorOfChartType = value;
      if(this.meetingsByDepartmentListChart!= null){
        this.meetingsByDepartmentListChart.destroy()
        this.createMeetingsByAllDepartmentReportChart()
      }
    }
    if(this.reportType == 'department'){
      this.colorOfChartType = value;
      if(this.meetingsByDepartmentListChart!= null){
        this.meetingsByDepartmentListChart.destroy()
        this.createMeetingsByDepartmentReportChart()
      }
    }
    if(this.reportType =='attended'){
      this.colorOfChartType = value;
      if(this.attendedMeetingListChart!= null){
        this.attendedMeetingListChart.destroy()
        this.createMeetingsByAttendeeReportChart()
      }

    }
    if(this.reportType == 'employee'){
      this.colorOfChartType = value;
      if(this.organizedmeetingListChart!= null){
        this.organizedmeetingListChart.destroy()
        this.createMeetingsByOrganizerReportChart()
      }
    }
  }

  currentMenuItem: MenuItem;
  async getCurrentMenuItemDetails(): Promise<MenuItem> {
    const response = await lastValueFrom(this.menuItemService.findMenuItemByName('Meeting Reports')).then(response => {
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

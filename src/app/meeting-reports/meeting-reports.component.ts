import { AfterViewInit, Component, OnInit, Output } from '@angular/core';
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
export class MeetingReportsComponent implements OnInit, AfterViewInit {

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
    })
  }
  clearable:boolean=true;
  searchable:boolean=true;
  Table:any;
  ngAfterViewInit(): void {
    this.getEmployeeAsUserList();      
      this.getAllDepartments();
      if(this.loggedInUserRole==="SUPER_ADMIN"||this.loggedInUserRole==="ADMIN"){
      this.getAllMeetings();
      this.getAllDepartmentsCount();
      this.getAllDepartmentNames();
      }else{
        this.clearable=false;
        this.searchable=false;
        //this.selectedDepartment=localStorage.getItem("deptID")
        // console.log("called choose dep on ng after")
       // this.chooseDepartment();

        
      }
     // this.InitailizeJqueryDataTable();
     
  }
  InitailizeJqueryDataTable() {
    console.log("enteedjquery")
    setTimeout(() => {
      if(this.Table!=null){
        this.Table.destroy();
      }
      $(document).ready(() => {
        this.Table = $('.table').DataTable({
          paging: true,
          searching: true,
          pageLength: 10,
          stateSave:true,
          order: [[1, 'desc']],
          lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]], // Set the options for the "Show entries" dropdown
          // Add other options here as needed
          columnDefs:[{
            // Configure date sorting for column 5 (index 4)
            "targets": [4,5],
            "type": "date", // Set internal data type for sorting
            "render": function (data, type, row) {
              // Create a new JavaScript Date object directly from the provided format
              const dateObj = new Date(data);

              // Format the date object for display using the desired format string
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
      
              return formattedDate;
            }
          }]
        });
      });
    }, 900);
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
      if (this.userRoleMenuItemsPermissionMap.has(currentMenuItem.menuItemId.toString().trim())) {
        //this.noPermissions = false;
        //provide permission to access this component for the logged in user if view permission exists
        //get permissions of this component for the user
        var menuItemPermissions = this.userRoleMenuItemsPermissionMap.get(this.currentMenuItem.menuItemId.toString().trim());
        if (menuItemPermissions.includes('View')) {
          this.viewPermission = true;
          //get logged in user details
    this.headerService.fetchUserProfile(this.loggedInUser).subscribe({
      next: response => {
        this.loggedInUserObject = response.body;
        console.log(this.loggedInUserObject)
        localStorage.setItem("deptID",this.loggedInUserObject.employee.departmentId.toString())
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
        }
      },error: error => {
        this.navigateToSessionTimeout(error);
      }
    })
  }

  departmentListForTheUser:any
  getEmployeeAsUserList(){
    if(this.loggedInUserRole==="SUPER_ADMIN"||this.loggedInUserRole==="ADMIN"){
    this.employeeService.getUserStatusEmployees(true).subscribe({
      next: response => {
        this.employeeListAsUser = response.body;
      },error: error => {
        this.navigateToSessionTimeout(error);
      }
    })
  }else{
    this.departmentService.getDepartmentByDepartmentHead(this.loggedInUser).subscribe({
      next: response => {
        this.departmentListForTheUser = response.body;
        this.departmentListForTheUser.filter(deptId=>{
          this.selectedDepartment=deptId.departmentId;          
        })   
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }
      }
  })
  }
}

  navigateToSessionTimeout(error: any){
    if(error.status === HttpStatusCode.Unauthorized){
      this.router.navigateByUrl('/session-timeout');
    }
  }

  getAllDepartments(){
    if(this.loggedInUserRole==="SUPER_ADMIN"||this.loggedInUserRole==="ADMIN"){
    this.departmentService.getDepartmentList().subscribe({
      next: response => {
        this.departmentList = response.body;
      },error: error => {
        this.navigateToSessionTimeout(error);
      }
    })
  }else{
    this.departmentService.getDepartmentByDepartmentHead(this.loggedInUser).subscribe({
      next: response => {
        console.log(response)
        this.departmentList = response.body;
        this.selectedDepartment=this.departmentList[0].departmentId.toString();
        this.getDepartmentById(parseInt(this.selectedDepartment));
        if(this.meetingsByDepartmentListChart!=null){
          this.meetingsByDepartmentListChart.destroy()
        }
        this.getmeetingsByDepartmentReport(parseInt(this.selectedDepartment));
       
       console.log( this.departmentList)
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }
      }
    })
  }
}

  chooseEmployee(){
    if(this.organizedmeetingListChart != null){
      this.organizedmeetingListChart.destroy();
    }
    this.getMeetingsByOrganizerReport(this.selectedEmployee);
  }

  chooseDepartment(){
    if(this.loggedInUserRole==="SUPER_ADMIN"||this.loggedInUserRole==="ADMIN"){
    if(this.selectedDepartment!=null){
    console.log(this.selectedDepartment)
    if(this.meetingsByDepartmentListChart != null){
      this.meetingsByDepartmentListChart.destroy();
      //get department details
      this.getDepartmentById(parseInt(this.selectedDepartment))
    }
    this.getmeetingsByDepartmentReport(parseInt(this.selectedDepartment));
  }else{
    this.setChartType('line')
  }
  }else{
    if(this.meetingsByDepartmentListChart != null){
      this.meetingsByDepartmentListChart.destroy();
      //get department details
      this.getDepartmentById(parseInt(this.selectedDepartment))
    }
    this.getmeetingsByDepartmentReport(parseInt(this.selectedDepartment));  }
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
        this.navigateToSessionTimeout(error);
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
  meetingsByOrg:any[]
  meetingsByOrgxlabels:any[]
  createMeetingsByOrganizerReportChart(){
    if(this.type==='line'){
      this.meetingsByOrg=[0,this.organizedMeetingListCount,];
      this.meetingsByOrgxlabels=['','Total meetings of an organizer',''];
    }
    else{
      this.meetingsByOrg=[this.organizedMeetingListCount];
      this.meetingsByOrgxlabels=['Total meetings of an organizer'];
    }
    this.organizedmeetingListChart = new Chart("organizedmeetingListChart", {
      type: this.type,
      data: {// values on X-Axis
        xLabels: this.meetingsByOrgxlabels,
        datasets: [
          {
            label: "Total meetings of an organizer",
            data: this.meetingsByOrg,
            backgroundColor: 'rgba(216, 175, 53, 0.8)', // Yellow
            borderColor: 'rgba(216, 175, 53, 1)',
            borderWidth: 3,
          },
        ]
      },
      options: {
        aspectRatio: 2.3,
        scales: {
          x: {
            display: true,
            grid: {
              display: false,
            },
            ticks: {
              maxRotation: 0,    // Set the maximum rotation angle to 0 degrees
              autoSkip: false, 
            }
          },
          y: {
            beginAtZero: true,
            min :0,
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
            text: 'Total meetings of an organizer',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }
  meetingByDepartmentdata:any[];
  meetingLabelforxLabels:any[];
  createMeetingsByDepartmentReportChart(){
    if(this.type==='line'){
      this.meetingByDepartmentdata=[0,this.meetingsByDepartmentListCount,];
      this.meetingLabelforxLabels=['','Total meetings of a department','']
    }
    else{
      this.meetingByDepartmentdata=[this.meetingsByDepartmentListCount];
      this.meetingLabelforxLabels=['Total meetings of a department']
    }
    this.meetingsByDepartmentListChart = new Chart("meetingsByDepartmentListChart", {
      type: this.type,
      data: {// values on X-Axis
        xLabels: this.meetingLabelforxLabels,
        datasets: [
          {
            label: "Total meetings of a department",
           data:  this.meetingByDepartmentdata,
           //data: [this.OrganizedMeetingCount],
            backgroundColor: 'rgba(197, 14, 71, 0.8)', // Yellow
            borderColor: 'rgba(197, 14, 71, 1)',
            borderWidth: 3,
          },
        ]
      },
      options: {
        aspectRatio: 2.3,
        scales: {
          x: {
            display: true,
            grid: {
              display: false,
            },
            ticks: {
              maxRotation: 0,    // Set the maximum rotation angle to 0 degrees
              autoSkip: false, 
            }
          },
          y: {
            beginAtZero: true,
            min :0,
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

  meetingByAttendeeData:any[];
  meetingByAttendeeXLabels:any[];
  createMeetingsByAttendeeReportChart(){
    if(this.type==='line'){
      this.meetingByAttendeeData=[0,this.attendedMeetingListCount,];
      this.meetingByAttendeeXLabels=['','Total meetings of an attendee',''];
    }
    else{
      this.meetingByAttendeeData=[this.attendedMeetingListCount];
      this.meetingByAttendeeXLabels=['Total meetings of an attendee'];
    }
    this.attendedMeetingListChart = new Chart("attendedMeetingListChart", {
      type: this.type,
      data: {// values on X-Axis
        xLabels: this.meetingByAttendeeXLabels,
        datasets: [
          {
            label: "Total meetings of an attendee",
            data: this.meetingByAttendeeData,
            backgroundColor: 'rgba(101, 200, 255, 0.8)', // Yellow
            borderColor: 'rgba(101, 200, 255, 1)',
            borderWidth: 3,
          },
        ]
      },
      options: {
        aspectRatio: 2.3,
        scales: {
          x: {
            display: true,
            grid: {
              display: false,
            },
            ticks: {
              maxRotation: 0,    // Set the maximum rotation angle to 0 degrees
              autoSkip: false, 
            }
          },
          y: {
            beginAtZero: true,
            min :0,
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
         var i =0;
         this.deptMeetingCount.forEach(deptCount =>{
           var deptCountString = (String)(deptCount);
           this.meetingDepartmentCount = deptCountString.split(',');
            var deptObject = new DepartmentCount();
            deptObject.deptId = this.meetingDepartmentCount[0]
            deptObject.meetingCount = this.meetingDepartmentCount[1]
           this.deptValueCount.push(deptObject);
         })
         this.getAllDepartmentNames()
         
       }
    })
  }
  deptValueCount1 : DepartmentCount[] = [];
  getAllDepartmentNames(){
     this.getAllDepartments();
     //this.deptValueCount1 = new DepartmentCount[this.deptValueCount.length]
     this.departmentList.forEach(deptList =>{
       this.deptValueCount.forEach(deptValue=>{
         if(deptList.departmentId === parseInt(deptValue.deptId) ){
            deptValue.departmentName = deptList.departmentName;
            deptValue.departmentHead = deptList.departmentHead;
         }
       })

     })
    
  }

  MeetingsByAllDepartmentData:any[];
  MeetingsByAllDepartmentXLabels:any[];
  createMeetingsByAllDepartmentReportChart(){
    if(this.type==='line'){
      this.meetingByAttendeeData=[0,this.OrganizedMeetingCount];
      this.MeetingsByAllDepartmentXLabels=['','Total meetings of all departments',''];
    }
    else{
      this.meetingByAttendeeData=[this.OrganizedMeetingCount];
      this.MeetingsByAllDepartmentXLabels=['Total meetings of all departments'];
    }
    this.meetingsByDepartmentListChart = new Chart("meetingsByDepartmentListChart", {
      type: this.type,
      data: {// values on X-Axis
        xLabels: this.MeetingsByAllDepartmentXLabels,
        datasets: [
          {
            label: "Total meetings of all departments",
            data: this.meetingByAttendeeData,
           //data: [this.OrganizedMeetingCount],
            backgroundColor: 'rgba(197, 14, 71, 0.8)', // Yellow
            borderColor: 'rgba(197, 14, 71, 1)',
            borderWidth: 3,
          },
        ]
      },
      options: {
        aspectRatio: 2.3,
        scales: {
          x: {
            display: true,
            grid: {
              display: false,
            },
            ticks: {
              maxRotation: 0,    // Set the maximum rotation angle to 0 degrees
              autoSkip: false, 
            }
          },
          y: {
            beginAtZero: true,
            min :0,
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
    
    if(this.reportType =='all' && this.selectedDepartment!= null ){
      this.colorOfChartType = value;
      if(this.meetingsByDepartmentListChart!= null){
        this.meetingsByDepartmentListChart.destroy()
        this.createMeetingsByDepartmentReportChart()
      }
    }
    else if(this.reportType =='all'){
      this.colorOfChartType = value;
      if(this.meetingsByDepartmentListChart!= null){
        this.meetingsByDepartmentListChart.destroy()
        this.createMeetingsByAllDepartmentReportChart()
      }
    }
    else if(this.reportType == 'department'){
      this.colorOfChartType = value;
      if(this.meetingsByDepartmentListChart!= null){
        this.meetingsByDepartmentListChart.destroy()
        this.createMeetingsByDepartmentReportChart()
      }
    }
    else if(this.reportType =='attended'){
      this.colorOfChartType = value;
      if(this.attendedMeetingListChart!= null){
        this.attendedMeetingListChart.destroy()
        this.createMeetingsByAttendeeReportChart()
      }

    }
    else if(this.reportType == 'employee'){
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
      } else if (response.status === HttpStatusCode.Unauthorized) {
        this.router.navigateByUrl('/session-timeout');
      }
    }, reason => {
      if (reason.status === HttpStatusCode.Unauthorized) {
        this.router.navigateByUrl('/session-timeout')
      }
    }
    )
    return this.currentMenuItem;
  }

}

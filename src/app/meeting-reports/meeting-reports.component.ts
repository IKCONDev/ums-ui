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

  selectedEmployee: string;
  selectedDepartment: string;
  selectedDepartmentName: string;
  selectedAttendeeUser: string;

  organizedMeetingList :Meeting[];
  organizedMeetingListCount: number
  organizedmeetingListChart = null;
  meetingsByDepartmentList :Meeting[];
  meetingsByDepartmentListCount: number
  meetingsByDepartmentListChart  = null;
  attendedMeetingList: Meeting[];
  attendedMeetingListCount: number;
  attendedMeetingListChart = null;

  constructor(private router: Router, private activatedRoute: ActivatedRoute,
    private meetingReportService: MeetingReportsService,
    private employeeService: EmployeeService,
    private userService: UserService, 
    private headerService: HeaderService,
    private departmentService: DepartmentService) {

      //get current router param
    this.activatedRoute.queryParams.subscribe(param => {
      this.reportType = param['reportType'];
      console.log(this.reportType)
    })
  }

  ngOnInit(): void {
    //get logged in user details
    this.headerService.fetchUserProfile(this.loggedInUser).subscribe({
      next: response => {
        this.loggedInUserObject = response.body;
        this.selectedEmployee = this.loggedInUserObject.email;
        this.selectedDepartment = this.loggedInUserObject.employee.department.departmentId.toString();
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
      type: 'bar',
      data: {// values on X-Axis
        xLabels: ['Total Meetings of an organizer'],
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
    this.meetingsByDepartmentListChart = new Chart("meetingsByDepartmentListChart", {
      type: 'pie',
      data: {// values on X-Axis
        xLabels: ['Total Meetings of a department'],
        datasets: [
          {
            label: "Total Meetings of a department",
            data: [this.meetingsByDepartmentListCount],
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
            text: 'Total Meetings of a department',
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
      type: 'bar',
      data: {// values on X-Axis
        xLabels: ['Total Meetings of an attendee'],
        datasets: [
          {
            label: "Total Meetings of an attendee",
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
            text: 'Total Meetings of an attendee',
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

}

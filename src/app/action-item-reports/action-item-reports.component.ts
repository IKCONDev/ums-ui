import { AfterViewInit, Component, OnInit, Output } from '@angular/core';
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
import { MenuItem } from '../model/MenuItem.model';
import { lastValueFrom } from 'rxjs';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';

@Component({
  selector: 'app-action-item-reports',
  templateUrl: './action-item-reports.component.html',
  styleUrls: ['./action-item-reports.component.css']
})
export class ActionItemsReportsComponent implements OnInit,AfterViewInit {
  reportType: string;
  @Output() title = 'Action Item Reports'

  loggedInUserId: string = localStorage.getItem('email');

  departmentList: Department[];

  selectedDepartment: string;
  selectedDepartmentName: string;
  selectedUser: string;

  actionItemsByDepartmentReportChart =  null;
  actionItemsByDepartmentReportChart1 = null;

  viewPermission: boolean;
  createPermission: boolean;
  updatePermission: boolean;
  deletePermission: boolean;
  noPermissions: boolean;
  userRoleMenuItemsPermissionMap: Map<string, string>
  loggedInUserRole = localStorage.getItem('userRole');

  constructor(private activatedRoute:ActivatedRoute, private deprtmentService: DepartmentService,
    private router: Router, private actionItemsReportService: ActionItemsReportsService, 
    private employeeService: EmployeeService, private headerService: HeaderService, 
    private departmentService: DepartmentService, private actionService:ActionService,
    private menuItemService: AppMenuItemService){

    this.activatedRoute.queryParams.subscribe(param => {
      this.reportType = param['reportType'];
    }) 
  }
  clearable:boolean=true;
  searchable:boolean=true;
  ngAfterViewInit(): void {
    if(this.loggedInUserRole==="SUPER_ADMIN"||this.loggedInUserRole==="ADMIN"){
    // this.getAllDepartments();
    // this.getEmployeeAsUserList();
    this.getAllActionItemsCount();
    this.InitailizeJqueryDataTable();
    }else{
      this.clearable=false;
        this.searchable=false;
      //  this.selectedDepartment=localStorage.getItem("deptID")
        // console.log("called choose dep on ng after")
        this.chooseDepartment();
        this.InitailizeJqueryDataTable();
    } 
  }
  
  Table4:any;
  Table5: any;
  Table3: any;
  Table2 : any;
  InitailizeJqueryDataTable() {
    // console.log("enteedjquery")
    setTimeout(() => {
      if(this.Table4!=null){
        this.Table4.destroy();
      }
      $(document).ready(() => {
        this.Table4 = $('#table4').DataTable({
          paging: true,
          searching: true,
          pageLength: 10,
          stateSave:true,
          order: [[1, 'desc']],
          lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]], // Set the options for the "Show entries" dropdown
        });
      });
    }, 900);
  }

  InitializeDataTable5(){
    setTimeout(() => {
      if(this.Table5!=null){
        this.Table5.destroy();
      }
      $(document).ready(() => {
        this.Table5 = $('#table5').DataTable({
          paging: true,
          searching: true,
          pageLength: 10,
          stateSave:true,
          order: [[1, 'desc']],
          lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]], // Set the options for the "Show entries" dropdown
        });
      });
    }, 900);
  }

  InitializeDataTable3(){
    setTimeout(() => {
      // if(this.Table3!=null){
      //   this.Table3.destroy();
      // }
      $(document).ready(() => {
        this.Table3 = $('#table3').DataTable({
          paging: true,
          searching: true,
          pageLength: 10,
          stateSave:true,
          order: [[1, 'desc']],
          lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]], // Set the options for the "Show entries" dropdown
        });
      });
    }, 900);
  }

  InitializeDataTable2(){
    setTimeout(() => {
      // if(this.Table2!=null){
      //   this.Table2.destroy();
      // }
      $(document).ready(() => {
        this.Table2 = $('#table2').DataTable({
          paging: true,
          searching: true,
          pageLength: 10,
          stateSave:true,
          order: [[1, 'desc']],
          lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]], // Set the options for the "Show entries" dropdown
        });
      });
    }, 900);
  }

  selectedUserFullName: string;
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
      if (this.userRoleMenuItemsPermissionMap.has(currentMenuItem.menuItemId.toString().trim())) {
        //this.noPermissions = false;
        //provide permission to access this component for the logged in user if view permission exists
        //get permissions of this component for the user
        var menuItemPermissions = this.userRoleMenuItemsPermissionMap.get(this.currentMenuItem.menuItemId.toString().trim());
        if (menuItemPermissions.includes('View')) {
          this.viewPermission = true;
          //get details to view reports
          this.headerService.fetchUserProfile(this.loggedInUserId).subscribe({
            next: response => {
              if(response.status === HttpStatusCode.Ok){
                this.loggedInUserPrincipalObject = response.body;
                this.selectedUser = this.loggedInUserPrincipalObject.email;
                //this.selectedDepartment = this.loggedInUserPrincipalObject.employee.department.departmentId.toString();
                localStorage.setItem("deptID",this.loggedInUserPrincipalObject.employee.departmentId.toString())
                this.selectedDepartmentName = this.loggedInUserPrincipalObject.employee.department.departmentName;
                this.selectedPriority = 'High';
                // console.log("response is coming from ngonint")
              }
            }
          })
          setTimeout(() => {
             //initialize data
            this.getAllDepartments();
            this.getEmployeeAsUserList();
           // this.getAllActionItemsCount();
            // this.getAllDepartmentsCount();
            // this.getAllDepartmentNames();
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
              // console.log("thiss all is called")
               this.getAllDepartmentsCount();
               this.getAllDepartmentNames();
            }
          },200)
    
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

  department: Department;
  getDepartment(){
    // console.log(this.selectedDepartment)
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
    // console.log("next the get employeeAsUser List is called")
    if(this.loggedInUserRole==="SUPER_ADMIN"||this.loggedInUserRole==="ADMIN"){
    this.employeeService.getUserStatusEmployees(true).subscribe({
      next: response => {
        this.employeeListAsUser = response.body;
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }
      }
    })
  }else{
    this.employeeService.getUserStatusBasedOnDepartmentHead(this.loggedInUserId).subscribe({
      next: response => {
        this.employeeListAsUser = response.body;
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }
      }
  })
  }
}

  async getAllDepartments(): Promise<void>{
    // console.log("getAllDepartments"+"is called")
    if(this.loggedInUserRole==="SUPER_ADMIN"||this.loggedInUserRole==="ADMIN"){
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
  }else{
    this.departmentService.getDepartmentByDepartmentHead(this.loggedInUserId).subscribe({
      next: response => {
        // console.log(response)
        this.departmentList = response.body;
        this.selectedDepartment=this.departmentList[0].departmentId.toString();
        this.getDepartment();
        if(this.actionItemsByDepartmentReportChart!=null){
          this.actionItemsByDepartmentReportChart.destroy()
        }
        this.getActionItemsReportByDepartment(this.selectedDepartment);
      //  console.log( this.departmentList)
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }
      }
    })
  }
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
          },700)
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
          // console.log(response)
          this.actionItemsCountOfDepartment = response.body.length;
          this.getDepartment();
          if(this.actionItemsByDepartmentReportChart!=null){
            this.actionItemsByDepartmentReportChart.destroy()
          }
          this.createActionItemsByDepartmentReportChart();
          if(this.actionItemsCountOfDepartment > 0){
            this.InitializeDataTable5();
          }else{
            this.Table5.destroy();
          }
          // console.log(this.actionItemsCountOfDepartment)
          
           
      
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
    // console.log("this.chooseDepartment is called "+this.selectedDepartment)
    if(this.actionItemsByDepartmentReportChart != null){
      this.actionItemsByDepartmentReportChart.destroy();
    }
    if(this.selectedDepartment!=null){
      // console.log(this.selectedDepartment+"entere in to te !null")
    this.getActionItemsReportByDepartment(this.selectedDepartment)
    }
    else{
       this.getAllActionItemsCount();
       this.Table5.destroy();
       this.InitailizeJqueryDataTable();
    }
    this.Table4.destroy();
}

  actionItemsByPriorityReportChart = null;

  choosePriority(){
    if(this.actionItemsByPriorityReportChart != null){
      this.actionItemsByPriorityReportChart.destroy();
    }
    this.getActionItemsReportByPriority(this.selectedPriority);
    if(this.Table3!=null){
      this.Table3.destroy();
    }
    this.InitializeDataTable3();
  }


  actionItemsByPriorityData:any[];
  actionItemsByPriorityXLabels:any[];
  createActionItemsByPriorityReportChart(){
    if(this.type==='line'){
      this.actionItemsByPriorityData=[0,this.actionItemsCountByPriority];
      this.actionItemsOfOrganizerXLabels=['','Total Action Items based on priority','']
    }else{
      this.actionItemsByPriorityData=[this.actionItemsCountByPriority];
      this.actionItemsOfOrganizerXLabels=['Total Action Items based on priority']
    }
    this.actionItemsByPriorityReportChart = new Chart("actionItemsByPriorityReportChart", {
      type: this.type,
      data: {// values on X-Axis
        xLabels: this.actionItemsOfOrganizerXLabels,
        datasets: [
          {
            label: "Total Action Items based on priority",
            data: this.actionItemsByPriorityData,
            backgroundColor: 'rgba(175, 136, 245, 0.8)', // violet
            borderColor: 'rgba(175, 136, 245, 1)',
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
            beginAtZero:true,
            min:0,
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
            text: 'Total Action Items based on priority',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }


  actionItemsByDepartmentData:any[];
  actionItemsByDepartmentXLabels:any[];
  createActionItemsByDepartmentReportChart(){
    // console.log("called ythis for dep chart")
    if(this.type==='line'){
        this.actionItemsByDepartmentData=[0,this.actionItemsCountOfDepartment];
        this.actionItemsByDepartmentXLabels=['','Total Action Items of a department','']
    }else{
      // console.log(this.actionItemsCountOfDepartment)
      this.actionItemsByDepartmentData=[this.actionItemsCountOfDepartment];
      // console.log(this.actionItemsByDepartmentData+" "+"actionitemdepartmentdata")
        this.actionItemsByDepartmentXLabels=['Total Action Items of a department'];
    }
    this.actionItemsByDepartmentReportChart = new Chart("actionItemsByDepartmentReportChart", {
      type: this.type,
      data: {// values on X-Axis
        xLabels: this.actionItemsByDepartmentXLabels,
        datasets: [
          {
            label: "Total Action Items of a department",
            data:this.actionItemsByDepartmentData,
            backgroundColor: 'rgba(175, 136, 245, 0.8)', // violet
            borderColor: 'rgba(175, 136, 245, 1)',
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
            beginAtZero:true,
            min:0,
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
            text: 'Total Action Items of a department',
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
    if(this.Table2!=null){
      this.Table2.destroy();
    }
    this.InitializeDataTable2();
  }

  actionItemsByOrganizerReportChart = null;

  actionItemsOfOrganizerData:any[];
  actionItemsOfOrganizerXLabels:any[];
  createActionItemsOfOrganizerReportChart(){
    if(this.type==='line'){
        this.actionItemsOfOrganizerData=[0,this.actionItemsCountOforganizer];
        this.actionItemsOfOrganizerXLabels=['','Total Action Items of an organizer',''];
    }else{
      this.actionItemsOfOrganizerData=[this.actionItemsCountOforganizer];
      this.actionItemsOfOrganizerXLabels=['Total Action Items of an organizer'];
    }
    this.actionItemsByOrganizerReportChart = new Chart("actionItemsByOrganizerReportChart", {
      type: this.type,
      data: {// values on X-Axis
        xLabels: this.actionItemsOfOrganizerXLabels,
        datasets: [
          {
            label: "Total Action Items of an organizer",
            data: this.actionItemsOfOrganizerData,
            backgroundColor: 'rgba(1255, 106, 149, 0.8)', // violet
            borderColor: 'rgba(255, 106, 149, 1)',
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
            beginAtZero:true,
            min:0,
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
            text: 'Total Action Items of an organizer',
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
         var i =0;
         this.deptMeetingCount.forEach(deptCount =>{
           var deptCountString = (String)(deptCount);
           this.meetingDepartmentCount = deptCountString.split(',');
            var deptObject = new DepartmentCount();
            deptObject.deptId = this.meetingDepartmentCount[0]
            deptObject.meetingCount = this.meetingDepartmentCount[1]
           this.deptValueCount.push(deptObject);
         })
         if(this.actionItemsByDepartmentReportChart ! = null){
           this.actionItemsByDepartmentReportChart.destroy();
          // this.createActionItemsAllDepartmentReportChart()
         }
        
         this.getAllDepartmentNames()
       }
    })
    this.Table5.destroy();
    this.InitailizeJqueryDataTable();
  }
  deptValueCount1 : DepartmentCount[] = [];
  getAllDepartmentNames(){
     this.getAllDepartments();
     //this.deptValueCount1 = new DepartmentCount[this.deptValueCount.length]
     this.departmentList.map(deptList =>{
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
 async getAllActionItemsCount() : Promise<void>{
    this.actionService.getAllActionItems().subscribe({
       next : response =>{
         this.allActionItems= response.body;
         this.allActionItemsCount = response.body.length;
         this.createActionItemsAllDepartmentReportChart()
       }
    })
    //this.actionItemsAllDepartmentReportChart()
  }
  
  actionItemsAllDepartmentData:any[];
  actionItemsAllDepartmentXLabels:any[];
  actionItemsByAllDepartmentReportChart:any;
  createActionItemsAllDepartmentReportChart(){
    if(this.actionItemsByDepartmentReportChart !=null){
      this.actionItemsByDepartmentReportChart.destroy()
    }
    if(this.type==='line'){
      this.actionItemsAllDepartmentData=[0,this.allActionItemsCount,];
      this.actionItemsAllDepartmentXLabels=['','Total Action Items of all departments','']
    }else{
      this.actionItemsAllDepartmentData=[this.allActionItemsCount];
      this.actionItemsAllDepartmentXLabels=['Total Action Items of all departments']
    }
    this.actionItemsByAllDepartmentReportChart = new Chart("actionItemsByDepartmentReportChart", {
      type: this.type,
      data: {// values on X-Axis
        xLabels: this.actionItemsAllDepartmentXLabels,
        datasets: [
          {
            label: "Total Action Items of all departments",
            data: this.actionItemsAllDepartmentData,
            backgroundColor: 'rgba(175, 136, 245, 0.8)', // violet
            borderColor: 'rgba(175, 136, 245, 1)',
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
            beginAtZero:true,
            min:0,
            display: true,
            grid: {
              display: true,
            },
            ticks: {
              stepSize: 1, // Set stepSize to 1 to display only whole numbers on the y-axis
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
            text: 'Total Action Items of all departments',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }


  type : any = 'line'
  colorOfChartType : any = 'line'
  setChartType(value : any){
    // console.log("this.setChartType is called")
    this.type = value;
    if(this.reportType == 'department'){
      this.colorOfChartType = value
         this.actionItemsByDepartmentReportChart.destroy()
         this.createActionItemsByDepartmentReportChart()
    }
    else if(this.reportType == 'all' && this.selectedDepartment != null){
      
      this.colorOfChartType = value
         this.actionItemsByDepartmentReportChart.destroy()
         this.createActionItemsByDepartmentReportChart()
    }
    
    else if(this.reportType == 'all' ){
      // console.log("all is called"+value)
       this.colorOfChartType = value
       if(this.actionItemsByAllDepartmentReportChart==null){
      //   console.log("enter the null part")
      //  console.log( document.getElementsByTagName("canvas"))
        this.createActionItemsAllDepartmentReportChart() 
       }
       else{
        // console.log("enter the else part")
        this.actionItemsByAllDepartmentReportChart.destroy()
          this.createActionItemsAllDepartmentReportChart()        
       }
       
       
    }
    
    else if(this.reportType == 'priority'){
      this.colorOfChartType = value
      this.actionItemsByPriorityReportChart.destroy()
      this.createActionItemsByPriorityReportChart()

    }
    else if(this.reportType == 'organized'){
      //this.type = value
       this.colorOfChartType = value
       this.actionItemsByOrganizerReportChart.destroy()
       this.createActionItemsOfOrganizerReportChart()
    }
    
  }

  currentMenuItem: MenuItem;
  async getCurrentMenuItemDetails(): Promise<MenuItem> {
    const response = await lastValueFrom(this.menuItemService.findMenuItemByName('Action Item Reports')).then(response => {
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

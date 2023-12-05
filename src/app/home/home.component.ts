import { Component, Input, OnChanges, OnInit, Output } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { HomeService } from './service/home.service';
import { outputAst } from '@angular/compiler';
import { SideMenubarComponent } from '../side-menubar/side-menubar.component';
import { HttpStatusCode } from '@angular/common/http';
import { HeaderService } from '../header/service/header.service';
import { error, type } from 'jquery';
import { Chart, registerables } from 'chart.js';
import { Meeting } from '../model/Meeting.model';
import { NumberValueAccessor } from '@angular/forms';
import { TaskStatusModel } from '../model/taskStatus.model';
import { NotificationService } from '../notifications/service/notification.service';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';
import { MenuItem } from '../model/MenuItem.model';
import { lastValueFrom } from 'rxjs';
import ChartDataLabels from 'chartjs-plugin-datalabels'
Chart.register(...registerables);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  loggedInUser = localStorage.getItem('email');
  loggedInUserRole = localStorage.getItem('userRole');
  title: string = 'Overview';
  organizedMeetingsCount: string;
  attendedMeetingsCount: string;
  actionItemsCount: number = 0;
  organizedTasksCount: number = 0;
  assignedTasksCount: number = 0;

  //contains the logged in user role, menuitems and its permissions
  userRoleMenuItemsPermissionMap: Map<String, String>

  loginDetails = {
    firstName: '',
    token: '',
    userId: '',
    userRole: '',
    userData: ''
  }
  selectedOption: string;
  selectedOption2: string;
  MajorselectedOption: string;

  /**
   * 
   */
  onSelectChange() {
    console.log("entered onselect change")
    if (this.selectedOption === 'Week' && this.MajorselectedOption === 'All') {
      this.fetchTaskStatus();
    } else if (this.selectedOption === 'months' && this.MajorselectedOption === 'All') {
      this.fetchTaskStatus();
    }
    else if (this.selectedOption === 'Year' && this.MajorselectedOption === 'All') {
      this.fetchTaskStatus();
    }
    if (this.selectedOption === 'Week' && this.MajorselectedOption === 'Total') {
      this.fetchTotalTaskStatus();
    } else if (this.selectedOption === 'months' && this.MajorselectedOption === 'Total') {
      this.fetchTotalTaskStatus();
    }
    else if (this.selectedOption === 'Year' && this.MajorselectedOption === 'Total') {
      this.fetchTotalTaskStatus();
    }
    if (this.selectedOption === 'Week' && this.MajorselectedOption === 'Yet to start') {
      this.fetchYetToStartTaskStatus();
    } else if (this.selectedOption === 'months' && this.MajorselectedOption === 'Yet to start') {
      this.fetchYetToStartTaskStatus();
    }
    else if (this.selectedOption === 'Year' && this.MajorselectedOption === 'Yet to start') {
      this.fetchYetToStartTaskStatus();
    }
    if (this.selectedOption === 'Week' && this.MajorselectedOption === 'Inprogress') {
      this.fetchInprogressTaskStatus();
    } else if (this.selectedOption === 'months' && this.MajorselectedOption === 'Inprogress') {
      this.fetchInprogressTaskStatus();
    }
    else if (this.selectedOption === 'Year' && this.MajorselectedOption === 'Inprogress') {
      this.fetchInprogressTaskStatus();
    }
    if (this.selectedOption === 'Week' && this.MajorselectedOption === 'Completed') {
      this.fetchCompletedTaskStatus();
    } else if (this.selectedOption === 'months' && this.MajorselectedOption === 'Completed') {
      this.fetchCompletedTaskStatus();
    }
    else if (this.selectedOption === 'Year' && this.MajorselectedOption === 'Completed') {
      this.fetchCompletedTaskStatus();
    }

  }
  onSelectChange2() {
    console.log("entered onselect change2")
    if (this.selectedOption2 === 'Week') {
      this.fetchTaskStatus2();
    } else if (this.selectedOption2 === 'months') {
      console.log('months')
      this.fetchTaskStatus2();
    }
    else if (this.selectedOption2 === 'Year') {
      console.log("entered for year");
      this.fetchTaskStatus2();
    }

  }

  //get the latest selected component on page load /refresh
  //selectedOption:string = localStorage.getItem('selectedComponent');
  //title:string = localStorage.getItem('title');
  isHomeComponentData:boolean=false;
  isComponentLoading:boolean=false;
  isPermissionData:boolean=false;
  /**
   * 
   * @param router 
   * @param homeService 
   */
  constructor(private router: Router, private homeService: HomeService, private headerService: HeaderService,
    private notificationService: NotificationService, private menuItemService: AppMenuItemService
  ) {
    let loginInfo = {
      firstName: '',
      token: '',
      userId: '',
      userRole: '',
      userData: ''
    }

    //get Navigation extras , collect from router object
    if (this.router.getCurrentNavigation().extras.state) {
      loginInfo = this.router.getCurrentNavigation().extras.state['loginInfo'];
      console.log(this.router.getCurrentNavigation().extras.state['loginInfo'])
      this.loginDetails = loginInfo
    }
    //get employeedetails
    this.headerService.fetchUserProfile(localStorage.getItem('email')).subscribe({
      next: response => {
        localStorage.setItem('firstName', response.body.employee.firstName);
        localStorage.setItem('lastName', response.body.employee.lastName);
        console.log(response)
        console.log(localStorage.getItem('lastName'))
      }
    });
  }


  /**
    * get user organized meetings count
    */
  getUserorganizedMeetingCount() {
    this.homeService.getUserorganizedMeetingCount().subscribe({
      next: (response) => {
        this.organizedMeetingsCount = response.body.toString();
        console.log(this.organizedMeetingsCount)
        // localStorage.setItem('totalMeetingsOrganized',response.body.toString())
      }, error: (error) => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl('/session-timeout')
        }
      }
    })
  }

  /**
     * get User attended meetings count
     */
  getUserAttendedMeetingCount() {
    this.homeService.getUserAttendedMeetingCount().subscribe({
      next: (response) => {
        this.attendedMeetingsCount = response.body.toString();
        console.log(this.attendedMeetingsCount);
        //localStorage.setItem('attenedMeetingsCount',response.body.toString());
      }, error: (error) => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl('/session-timeout')
        }
      }
    })
  }

  /**
   * 
   */
  viewPermission: boolean = false;
  createPermission: boolean = false;
  updatePermission: boolean = false;
  deletePermission: boolean = false;
  async ngOnInit(): Promise<void> {

    this.isComponentLoading=true;
    this.isHomeComponentData=true;
    this.isPermissionData=true;

    if(localStorage.getItem('jwtToken') === null){
      this.router.navigateByUrl('/session-timeout');
    }
    
    if (localStorage.getItem('userRoleMenuItemPermissionMap') != null) {
      this.userRoleMenuItemsPermissionMap = new Map(Object.entries(JSON.parse(localStorage.getItem('userRoleMenuItemPermissionMap'))));
    }
    //get menu item  details of home page
    var currentMenuItem = await this.getCurrentMenuItemDetails();
    console.log(currentMenuItem)

      if (this.userRoleMenuItemsPermissionMap.has(currentMenuItem.menuItemId.toString().trim())) {
        //provide permission to access this component for the logged in user if view permission exists
        this.isComponentLoading=false;
        this.isHomeComponentData=false;
        console.log('exe')
        //get permissions of this component for the user
        var menuItemPermissions = this.userRoleMenuItemsPermissionMap.get(this.currentMenuItem.menuItemId.toString().trim());
        if (menuItemPermissions.includes('View')) {
          this.viewPermission = true;
          //get all counts and display in home/overview poge
          this.getUserorganizedMeetingCount();
          this.getUserOrganizedActionItemsCount();
          this.getUserAssignedTasksCount();
          this.getUserOrganizedTasksCount();
          this.getUserAttendedMeetingCount();
          if (this.selectedOption != 'months') {
            this.selectedOption = "Week";
          }
          if (this.selectedOption2 != 'months') {
            this.selectedOption2 = "Week";
          }
          this.MajorselectedOption = "All";

          this.onSelectChange();
          this.onSelectChange2();
        }
        if (menuItemPermissions.includes('Create')) {
          this.createPermission = true;
        }
        if (menuItemPermissions.includes('Update')) {
          this.updatePermission = true;
        }
        if (menuItemPermissions.includes('Delete')) {
          this.deletePermission = true;
        }
      }

    //get noti count
    this.getNotificationCount(this.loggedInUser);
    this.isPermissionData=false;
    this.isComponentLoading=false;
  }

  /*
  onSelectedOptionChange(event: any){
    console.log(event);
    //set the currenttly selected component from side manu bar into storage
    localStorage.setItem('selectedComponent',event);
    localStorage.setItem('title',event);
    //set the current selected item on to the page
    this.selectedOption = localStorage.getItem('selectedComponent');
    this.title = localStorage.getItem('title');
    //TODO---------------------
    //set overview as default component after logout in home page
  }
  */

  currentMenuItem: MenuItem;
  async getCurrentMenuItemDetails() : Promise<MenuItem> {
      const response =  await lastValueFrom(this.menuItemService.findMenuItemByName('Overview')).then(response => {
        if (response.status === HttpStatusCode.Ok) {
          this.currentMenuItem = response.body;
          console.log(this.currentMenuItem)
        }else if(response.status === HttpStatusCode.Unauthorized){
          console.log('eit')
          this.router.navigateByUrl('/session-timeout');
        }
      },reason => {
        if(reason.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }
      }
      )
    
    console.log(this.currentMenuItem);
    return this.currentMenuItem;
  }



  /**
   * 
   */
  getUserOrganizedActionItemsCount() {
    this.homeService.getActionItemsCountByUserId().subscribe({
      next: response => {
        this.actionItemsCount = response.body;
        console.log(response.body);
      }
    })
  }

  /**
   * 
   */
  getUserOrganizedTasksCount() {
    this.homeService.getOrganizedTasksCountByUserId().subscribe({
      next: response => {
        this.organizedTasksCount = response.body;
        console.log(response.body);
      }
    })
  }

  /**
   * 
   */
  getUserAssignedTasksCount() {
    this.homeService.getAssignedTasksCountByUserId().subscribe({
      next: response => {
        this.assignedTasksCount = response.body;
        console.log(response.body);
      }
    })
  }

  TotalTasks: any[];
  TotalTasksForYear: any[];
  TotalTasksForMonth: any[];

  fetchTaskStatus() {
    if (this.selectedOption === 'Week') {
      if (this.myChart != null) {
        this.myChart.destroy();
      }
      console.log("entered the fetch details of task")
      const currentDate = new Date();
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - currentDate.getDay())
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 6);//end of the week
      console.log(startDate.toISOString().split('T')[0]);
      console.log(endDate);

      this.homeService.fetchStatusforWeek(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).subscribe({
        next: response => {
          this.TotalTasks = response.body;
          console.log(this.TotalTasks)
          this.createChart();
        }
      })
    }
    else if (this.selectedOption === 'Year') {
      if (this.myChart != null) {
        this.myChart.destroy();
      }
      const startDate = new Date();
      const endDate = new Date();
      //add dynamic year
      startDate.setFullYear(new Date().getFullYear(), 0, 1);
      endDate.setFullYear(new Date().getFullYear(), 11, 31);
      console.log(startDate + "hellllooo");
      console.log(endDate);
      this.homeService.fetchTaskStatusForYear(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).subscribe({
        next: response => {
          console.log("entered the else if of fetchTask for year")
          this.TotalTasksForYear = response.body;
          console.log(this.TotalTasksForYear)
          this.createChart();
        }
      })

    }
    else if (this.selectedOption === 'months') {
      if (this.myChart != null) {
        this.myChart.destroy();
      }
      const startDate = new Date();
      const endDate = new Date();
      //add dynamic year
      startDate.setFullYear(new Date().getFullYear(), 0, 1);
      endDate.setFullYear(new Date().getFullYear(), 11, 31);
      console.log(endDate);
      this.homeService.fetchTaskStatusForYear(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).subscribe({
        next: response => {
          console.log("entered the else if of fetchTask for year for mont wise")
          this.TotalTasksForMonth = response.body;
          console.log(this.TotalTasksForMonth)
          this.createChart();
        }
      })

    }

  }
  TotalMeetingStatus: any[];
  TotalMeetingStatusForYear: any[];
  TotalMeetingStatusForMonth: any[];
  fetchTaskStatus2() {
    if (this.myChart2 != null) {
      this.myChart2.destroy();
    }
    if (this.selectedOption2 === 'Week') {
      console.log("entered the fetch details of meetings")
      const currentDate = new Date();
      const startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(currentDate.getDate() - currentDate.getDay())
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 6);//end of the week
      endDate.setHours(23, 59, 59, 999);//end of the day
      console.log(startDate.toISOString());
      console.log(startDate.toString())
      console.log(endDate);


      this.homeService.fetchMeetingStatusforWeek(startDate.toISOString(), endDate.toISOString()).subscribe({
        next: response => {
          console.log(response);
          this.TotalMeetingStatus = response.body;
          this.createChart2();

        }
      })
    } else if (this.selectedOption2 === 'Year') {
      if (this.myChart2 != null) {
        this.myChart2.destroy();
      }
      const startDate = new Date();
      const endDate = new Date();

      startDate.setFullYear(2023, 0, 1);
      startDate.setHours(0, 0, 0, 0);

      endDate.setFullYear(2023, 11, 31);
      endDate.setHours(23, 59, 59, 999);
      console.log(startDate + " " + endDate);
      this.homeService.fetchMeetingStatusForYear(startDate.toISOString(), endDate.toISOString()).subscribe({
        next: response => {
          console.log("entered the else if of fetchmeetings fo year")
          this.TotalMeetingStatusForYear = response.body;
          console.log(this.TotalMeetingStatusForYear)
          this.createChart2();
        }
      })


    }
    else if (this.selectedOption2 === 'months') {
      if (this.myChart2 != null) {
        this.myChart2.destroy();
      }
      const startDate = new Date();
      const endDate = new Date();

      startDate.setFullYear(2023, 0, 1);
      startDate.setHours(0, 0, 0, 0);

      endDate.setFullYear(2023, 11, 31);
      endDate.setHours(23, 59, 59, 999);
      console.log(startDate + " " + endDate);
      this.homeService.fetchMeetingStatusForYear(startDate.toISOString(), endDate.toISOString()).subscribe({
        next: response => {
          console.log("entered the else if of fetchmeetings fo year")
          this.TotalMeetingStatusForMonth = response.body;
          console.log(this.TotalMeetingStatusForMonth)
          this.createChart2();
        }
      })


    }


  }

  myChart = null;
  createChart() {
    if (this.selectedOption === 'Week') {
      this.myChart = new Chart("myChart", {
        type: 'bar',
        data: {// values on X-Axis
          xLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          datasets: [
            {
              label: "Total",
              data: this.TotalTasks[0],
              backgroundColor: 'rgba(255, 99, 132, 0.8)', // Red
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 3,
            },
            {
              label: "Yet To Start",
              data: this.TotalTasks[1],
              backgroundColor: 'rgba(255, 148, 112, 0.7) ', // darkOrange
              borderColor: 'rgba(255, 148, 112, 1)',
              borderWidth: 3,
            },
            {
              label: "Inprogress",
              data: this.TotalTasks[2],
              backgroundColor: 'rgba(255, 206, 86, 0.8)', // Yellow
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 3,
            },
            {
              label: "Completed",
              data: this.TotalTasks[3],
              backgroundColor: 'rgba(75, 192, 192, 0.8)', // Green
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 3,
            }

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
              ticks: {
                stepSize: 1, // Set stepSize to 1 to display only whole numbers on the y-axis
              },
            },
          },
          plugins: {
            datalabels: {
              anchor: 'end',
              align: 'top',
              formatter: Math.round,
              font: {
                  weight: 'bold'
              }
          },
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
              text: 'Task Status for the current Week',
              font: {
                size: 14,
              },
            },
          },
        }
      });
    } else if (this.selectedOption === 'Year') {
      this.myChart = new Chart("myChart", {
        type: 'bar',
        data: {// values on X-Axis
          xLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: "Total Tasks",
              data: this.TotalTasksForYear[0],
              backgroundColor: 'rgba(255, 99, 132, 0.8)', // Red
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 3,
            },
            {
              label: "Yet To Start Task",
              data: this.TotalTasksForYear[1],
              backgroundColor: 'rgba(255, 148, 112, 0.7) ', // darkOrange
              borderColor: 'rgba(255, 148, 112, 1)',
              borderWidth: 3,
            },
            {
              label: "Inprogress Task",
              data: this.TotalTasksForYear[2],
              backgroundColor: 'rgba(255, 206, 86, 0.8)', // Yellow
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 3,
            },
            {
              label: "Completed Task",
              data: this.TotalTasksForYear[3],
              backgroundColor: 'rgba(75, 192, 192, 0.8)', // Green
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 3,
            }

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
            datalabels: {
              anchor: 'end',
              align: 'top',
              formatter: Math.round,
              font: {
                  weight: 'bold'
              }
          },
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
              text: 'Task Status of current Year',
              align: 'start',
              font: {
                size: 14,
              },
            },
          },
        }
      });


    } else if (this.selectedOption === 'months') {
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('en-US', { month: 'short' });
      const currentMonthNumber = currentDate.getMonth();
      console.log(this.TotalTasksForMonth[0][currentMonthNumber])
      this.myChart = new Chart("myChart", {
        type: 'bar',
        data: {// values on X-Axis
          xLabels: [currentMonth],
          datasets: [
            {
              label: "Total Tasks",
              data: [this.TotalTasksForMonth[0][currentMonthNumber]],
              backgroundColor: 'rgba(255, 99, 132, 0.8)', // Red
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 3,
            },
            {
              label: "Yet To Start Task",
              data: [this.TotalTasksForMonth[1][currentMonthNumber]],
              backgroundColor: 'rgba(255, 148, 112, 0.7) ', // darkOrange
              borderColor: 'rgba(255, 148, 112, 1)',
              borderWidth: 3,
            },
            {
              label: "Inprogress Task",
              data: [this.TotalTasksForMonth[2][currentMonthNumber]],
              backgroundColor: 'rgba(255, 206, 86, 0.8)', // Yellow
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 3,
            },
            {
              label: "Completed Task",
              data: [this.TotalTasksForMonth[3][currentMonthNumber]],
              backgroundColor: 'rgba(75, 192, 192, 0.8)', // Green
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 3,
            }

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
            datalabels: {
              anchor: 'end',
              align: 'top',
              formatter: function(value, context) {
                return context.dataIndex + ': ' + Math.round(value*100) + '%';
              },
              font: {
                  weight: 'bold'
              }
          },
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
              text: 'Task Status of current Year',
              align: 'start',
              font: {
                size: 14,
              },
            },
          },
        }
      });
    }


  }
  myChart2 = null
  createChart2() {
    if (this.selectedOption2 === 'Week') {
      var dayColors = ['mistyrose', 'lightsteelblue', 'palegreen', 'lightcoral', 'thistle', 'lightsalmon', 'mediumseagreen'];

      this.myChart2 = new Chart("myChart2", {
        type: 'pie',
        data: {
          labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          datasets: [
            {
              label: "Organised Meetings",
              data: this.TotalMeetingStatus[1],
              backgroundColor: dayColors,

              borderWidth: 1.5,
            },
            {
              label: "Attended Meetings",
              data: this.TotalMeetingStatus[0],
              backgroundColor: dayColors,

              borderWidth: 1.5,
            }
          ]
        },
        options: {
          aspectRatio: 1.7,
          scales: {
            x: {
              display: false,
            },
            y: {
              display: false,
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'right',
              align: 'end',
              labels: {
                usePointStyle: true,
                font: {
                  size: 14,
                },
                padding: 16,
                pointStyle: 'rectRounded',

              },
            },
            title: {
              display: true,
              text: '   Meeting Status of Current Week',
              align: 'start',
              font: {
                size: 14,
              },
            },
          },
          elements: {
            arc: {
              borderRadius: 3,
              borderWidth: 2,
              borderAlign: 'inner' // Set the border width for pie chart segments
            },
          },
        }
      });
    } if (this.selectedOption2 === 'Year') {
      var mildColors = [
        'lavender', 'lightcyan', 'lightcoral', 'lightseagreen', 'lightpink', 'lightslategray',
        'mistyrose', 'lightgoldenrodyellow', 'lightseashell', 'lightblue', 'lightgreen', 'lightsteelblue'
      ];

      this.myChart2 = new Chart("myChart2", {
        type: 'pie',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: "Organised Meetings",
              data: this.TotalMeetingStatusForYear[1],
              backgroundColor: mildColors,

              borderWidth: 1.5,
            },
            {
              label: "Attended Meetings",
              data: this.TotalMeetingStatusForYear[0],
              backgroundColor: mildColors,

              borderWidth: 1.5,
            }
          ]
        },
        options: {
          aspectRatio: 1.7,
          scales: {
            x: {
              display: false,
            },
            y: {
              display: false,
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'right',
              align: 'end',
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
              text: '   Meeting Status of Current Year',
              align: 'start',
              font: {
                size: 14,
              },
            },
          },
          elements: {
            arc: {
              borderRadius: 3,
              borderWidth: 2,
              borderAlign: 'inner' // Set the border width for pie chart segments
            },
          },
        }
      });
    } if (this.selectedOption2 === 'months') {
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('en-US', { month: 'short' });
      const currentMonthNumber = currentDate.getMonth();
      console.log(this.TotalMeetingStatusForMonth[1][currentMonthNumber])
      this.myChart2 = new Chart("myChart2", {
        type: 'pie',
        data: {
          labels: [currentMonth],
          datasets: [
            {
              label: "Organised Meetings",
              data: [this.TotalMeetingStatusForMonth[1][currentMonthNumber]],
              backgroundColor: 'rgba(255, 99, 132, 0.8)', // Red
              borderWidth: 1.5,
            },
            {
              label: "Attended Meetings",
              data: [this.TotalMeetingStatusForMonth[0][currentMonthNumber]],
              backgroundColor: 'rgba(255, 148, 112, 0.7) ', // darkOrang
              borderWidth: 1.5,
            }
          ]
        },
        options: {
          aspectRatio: 1.7,
          scales: {
            x: {
              display: false,
            },
            y: {
              display: false,
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'right',
              align: 'end',
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
              text: '   Meeting status of current month',
              align: 'start',
              font: {
                size: 14,
              },
            },
          },
          elements: {
            arc: {
              borderRadius: 3,
              borderWidth: 2,
              borderAlign: 'inner' // Set the border width for pie chart segments
            },
          },
        }
      });
    }
  }

  /**
  * 
  * @param email 
  */
  @Output() notificationCount: number = 0;
  getNotificationCount(email: string) {
    // let notificationCount = 0;
    this.notificationService.findNotificationCount(email).subscribe({
      next: response => {
        this.notificationCount = response.body;
        localStorage.setItem('notificationCount', this.notificationCount.toString());
        console.log(localStorage.getItem('notificationCount'));
      }
    })
  }


  fetchTotalTaskStatus() {
    if (this.selectedOption === 'Week') {
      if (this.myChart != null) {
        this.myChart.destroy();
      }
      console.log("entered the fetch details of task")
      const currentDate = new Date();
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - currentDate.getDay())
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 6);//end of the week
      console.log(startDate.toISOString().split('T')[0]);
      console.log(endDate);

      this.homeService.fetchStatusforWeek(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).subscribe({
        next: response => {
          this.TotalTasks = response.body;
          console.log(this.TotalTasks)
          this.createChartForTotalTask();
        }
      })
    }
    else if (this.selectedOption === 'Year') {
      if (this.myChart != null) {
        this.myChart.destroy();
      }
      const startDate = new Date();
      const endDate = new Date();
      //add dynamic year
      startDate.setFullYear(new Date().getFullYear(), 0, 1);
      endDate.setFullYear(new Date().getFullYear(), 11, 31);
      console.log(startDate + "hellllooo");
      console.log(endDate);
      this.homeService.fetchTaskStatusForYear(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).subscribe({
        next: response => {
          console.log("entered the else if of fetchTask for year")
          this.TotalTasksForYear = response.body;
          console.log(this.TotalTasksForYear)
          this.createChartForTotalTask();
        }
      })

    }
    else if (this.selectedOption === 'months') {
      if (this.myChart != null) {
        this.myChart.destroy();
      }
      const startDate = new Date();
      const endDate = new Date();
      //add dynamic year
      startDate.setFullYear(new Date().getFullYear(), 0, 1);
      endDate.setFullYear(new Date().getFullYear(), 11, 31);
      console.log(endDate);
      this.homeService.fetchTaskStatusForYear(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).subscribe({
        next: response => {
          console.log("entered the else if of fetchTask for year for mont wise")
          this.TotalTasksForMonth = response.body;
          console.log(this.TotalTasksForMonth)
          this.createChartForTotalTask();
        }
      })

    }

  }
  //chart for total task 
  createChartForTotalTask() {
    if (this.selectedOption === 'Week') {
      this.myChart = new Chart("myChart", {
        type: 'bar',
        data: {// values on X-Axis
          xLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          datasets: [
            {
              label: "Total",
              data: this.TotalTasks[0],
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
              text: 'Total Task Status for the current Week',
              font: {
                size: 14,
              },
            },
          },
        }
      });
    } else if (this.selectedOption === 'Year') {
      this.myChart = new Chart("myChart", {
        type: 'bar',
        data: {// values on X-Axis
          xLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: "Total",
              data: this.TotalTasksForYear[0],
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
              text: 'Task Status of current Year',
              align: 'start',
              font: {
                size: 14,
              },
            },
          },
        }
      });


    } else if (this.selectedOption === 'months') {
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('en-US', { month: 'short' });
      const currentMonthNumber = currentDate.getMonth();
      console.log(this.TotalTasksForMonth[0][currentMonthNumber])
      this.myChart = new Chart("myChart", {
        type: 'bar',
        data: {// values on X-Axis
          xLabels: [currentMonth],
          datasets: [
            {
              label: "Total",
              data: [this.TotalTasksForMonth[0][currentMonthNumber]],
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
              text: 'Total task status of current month',
              align: 'start',
              font: {
                size: 14,
              },
            },
          },
        }
      });
    }
  }
  yetToStartTaskStatus: any = [];
  fetchYetToStartTaskStatus() {
    if (this.selectedOption === 'Week') {
      if (this.myChart != null) {
        this.myChart.destroy();
      }
      console.log("entered the fetch details of task")
      const currentDate = new Date();
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - currentDate.getDay())
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 6);//end of the week
      console.log(startDate.toISOString().split('T')[0]);
      console.log(endDate);

      this.homeService.fetchStatusforWeek(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).subscribe({
        next: response => {
          this.TotalTasks = response.body;
          console.log(this.TotalTasks)
          this.createChartForYetToStartTask();
        }
      })
    }
    else if (this.selectedOption === 'Year') {
      if (this.myChart != null) {
        this.myChart.destroy();
      }
      const startDate = new Date();
      const endDate = new Date();
      //add dynamic year
      startDate.setFullYear(new Date().getFullYear(), 0, 1);
      endDate.setFullYear(new Date().getFullYear(), 11, 31);
      console.log(startDate + "hellllooo");
      console.log(endDate);
      this.homeService.fetchTaskStatusForYear(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).subscribe({
        next: response => {
          console.log("entered the else if of fetchTask for year")
          this.TotalTasksForYear = response.body;
          console.log(this.TotalTasksForYear)
          this.createChartForYetToStartTask();
        }
      })

    }
    else if (this.selectedOption === 'months') {
      if (this.myChart != null) {
        this.myChart.destroy();
      }
      const startDate = new Date();
      const endDate = new Date();
      //add dynamic year
      startDate.setFullYear(new Date().getFullYear(), 0, 1);
      endDate.setFullYear(new Date().getFullYear(), 11, 31);
      console.log(endDate);
      this.homeService.fetchTaskStatusForYear(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).subscribe({
        next: response => {
          console.log("entered the else if of fetchTask for year for mont wise")
          this.yetToStartTaskStatus = response.body;
          this.createChartForYetToStartTask();
        }
      })

    }

  }


  createChartForYetToStartTask() {
    if (this.selectedOption === 'Week') {
      this.myChart = new Chart("myChart", {
        type: 'bar',
        data: {// values on X-Axis
          xLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          datasets: [
            {
              label: "Yet To Start",
              data: this.TotalTasks[1],
              backgroundColor: 'rgba(255, 148, 112, 0.7) ', // darkOrange
              borderColor: 'rgba(255, 148, 112, 1)',
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
              text: 'Yet to start Status for the current Week',
              font: {
                size: 14,
              },
            },
          },
        }
      });
    } else if (this.selectedOption === 'Year') {
      this.myChart = new Chart("myChart", {
        type: 'bar',
        data: {// values on X-Axis
          xLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: "Yet to start",
              data: this.TotalTasksForYear[1],
              backgroundColor: 'rgba(255, 148, 112, 0.7) ', // darkOrange
              borderColor: 'rgba(255, 148, 112, 1)',
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
              text: 'Yet to start status of current Year',
              align: 'start',
              font: {
                size: 14,
              },
            },
          },
        }
      });


    } else if (this.selectedOption === 'months') {
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('en-US', { month: 'short' });
      const currentMonthNumber = currentDate.getMonth();
      console.log(this.yetToStartTaskStatus[1][currentMonthNumber])
      this.myChart = new Chart("myChart", {
        type: 'bar',
        data: {// values on X-Axis
          xLabels: [currentMonth],
          datasets: [
            {
              label: "Yet to start",
              data: [this.yetToStartTaskStatus[1][currentMonthNumber]],
              backgroundColor: 'rgba(255, 148, 112, 0.7) ', // darkOrange
              borderColor: 'rgba(255, 148, 112, 1)',
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
              text: 'Yet to start Status of current month',
              align: 'start',
              font: {
                size: 14,
              },
            },
          },
        }
      });
    }
  }

  inprogressTaskForMonth: any = [];
  fetchInprogressTaskStatus() {
    if (this.selectedOption === 'Week') {
      if (this.myChart != null) {
        this.myChart.destroy();
      }
      console.log("entered the fetch details of task")
      const currentDate = new Date();
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - currentDate.getDay())
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 6);//end of the week
      console.log(startDate.toISOString().split('T')[0]);
      console.log(endDate);

      this.homeService.fetchStatusforWeek(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).subscribe({
        next: response => {
          this.TotalTasks = response.body;
          console.log(this.TotalTasks)
          this.createChartForInprogressTask();
        }
      })
    }
    else if (this.selectedOption === 'Year') {
      if (this.myChart != null) {
        this.myChart.destroy();
      }
      const startDate = new Date();
      const endDate = new Date();
      //add dynamic year
      startDate.setFullYear(new Date().getFullYear(), 0, 1);
      endDate.setFullYear(new Date().getFullYear(), 11, 31);
      console.log(startDate + "hellllooo");
      console.log(endDate);
      this.homeService.fetchTaskStatusForYear(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).subscribe({
        next: response => {
          console.log("entered the else if of fetchTask for year")
          this.TotalTasksForYear = response.body;
          console.log(this.TotalTasksForYear)
          this.createChartForInprogressTask();
        }
      })

    }
    else if (this.selectedOption === 'months') {
      if (this.myChart != null) {
        this.myChart.destroy();
      }
      const startDate = new Date();
      const endDate = new Date();
      //add dynamic year
      startDate.setFullYear(new Date().getFullYear(), 0, 1);
      endDate.setFullYear(new Date().getFullYear(), 11, 31);
      console.log(endDate);
      this.homeService.fetchTaskStatusForYear(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).subscribe({
        next: response => {
          console.log("entered the else if of fetchTask for year")
          this.inprogressTaskForMonth = response.body;
          console.log(this.TotalTasksForYear)
          this.createChartForInprogressTask();
        }
      })
    }
  }


  createChartForInprogressTask() {
    if (this.selectedOption === 'Week') {
      this.myChart = new Chart("myChart", {
        type: 'bar',
        data: {// values on X-Axis
          xLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          datasets: [
            {
              label: "Inprogress",
              data: this.TotalTasks[2],
              backgroundColor: 'rgba(255, 148, 112, 0.7) ', // darkOrange
              borderColor: 'rgba(255, 148, 112, 1)',
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
              text: 'Inprogress Status for the current Week',
              font: {
                size: 14,
              },
            },
          },
        }
      });
    } else if (this.selectedOption === 'Year') {
      this.myChart = new Chart("myChart", {
        type: 'bar',
        data: {// values on X-Axis
          xLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: "Inprogress Tasks",
              data: this.TotalTasksForYear[2],
              backgroundColor: 'rgba(255, 148, 112, 0.7) ', // darkOrange
              borderColor: 'rgba(255, 148, 112, 1)',
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
              text: 'Inprogress status of current Year',
              align: 'start',
              font: {
                size: 14,
              },
            },
          },
        }
      });


    } else if (this.selectedOption === 'months') {
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('en-US', { month: 'short' });
      const currentMonthNumber = currentDate.getMonth();
      console.log(this.inprogressTaskForMonth[2][currentMonthNumber])
      this.myChart = new Chart("myChart", {
        type: 'bar',
        data: {// values on X-Axis
          xLabels: [currentMonth],
          datasets: [
            {
              label: "Inprogress Tasks",
              data: [this.inprogressTaskForMonth[2][currentMonthNumber]],
              backgroundColor: 'rgba(255, 148, 112, 0.7) ', // darkOrange
              borderColor: 'rgba(255, 148, 112, 1)',
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
              text: 'Inprogress Status of current month',
              align: 'start',
              font: {
                size: 14,
              },
            },
          },
        }
      });
    }
  }

  completedTaskForMonth: any = [];
  fetchCompletedTaskStatus() {
    if (this.selectedOption === 'Week') {
      if (this.myChart != null) {
        this.myChart.destroy();
      }
      console.log("entered the fetch details of task")
      const currentDate = new Date();
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - currentDate.getDay())
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 6);//end of the week
      console.log(startDate.toISOString().split('T')[0]);
      console.log(endDate);

      this.homeService.fetchStatusforWeek(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).subscribe({
        next: response => {
          this.TotalTasks = response.body;
          console.log(this.TotalTasks)
          this.createChartForCompletedTask();
        }
      })
    }
    else if (this.selectedOption === 'Year') {
      if (this.myChart != null) {
        this.myChart.destroy();
      }
      const startDate = new Date();
      const endDate = new Date();
      //add dynamic year
      startDate.setFullYear(new Date().getFullYear(), 0, 1);
      endDate.setFullYear(new Date().getFullYear(), 11, 31);
      console.log(startDate + "hellllooo");
      console.log(endDate);
      this.homeService.fetchTaskStatusForYear(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).subscribe({
        next: response => {
          console.log("entered the else if of fetchTask for year")
          this.TotalTasksForYear = response.body;
          console.log(this.TotalTasksForYear)
          this.createChartForCompletedTask();
        }
      })

    }
    else if (this.selectedOption === 'months') {
      if (this.myChart != null) {
        this.myChart.destroy();
      }
      const startDate = new Date();
      const endDate = new Date();
      //add dynamic year
      startDate.setFullYear(new Date().getFullYear(), 0, 1);
      endDate.setFullYear(new Date().getFullYear(), 11, 31);
      console.log(endDate);
      this.homeService.fetchTaskStatusForYear(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]).subscribe({
        next: response => {
          console.log("entered the else if of fetchTask for year")
          this.completedTaskForMonth = response.body;
          console.log(this.TotalTasksForYear)
          this.createChartForCompletedTask();
        }
      })
    }
  }


  createChartForCompletedTask() {
    if (this.selectedOption === 'Week') {
      this.myChart = new Chart("myChart", {
        type: 'bar',
        data: {// values on X-Axis
          xLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          datasets: [
            {
              label: "Completed",
              data: this.TotalTasks[3],
              backgroundColor: 'rgba(255, 148, 112, 0.7) ', // darkOrange
              borderColor: 'rgba(255, 148, 112, 1)',
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
              text: 'Completed Status for the current Week',
              font: {
                size: 14,
              },
            },
          },
        }
      });
    } else if (this.selectedOption === 'Year') {
      this.myChart = new Chart("myChart", {
        type: 'bar',
        data: {// values on X-Axis
          xLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: "Completed ",
              data: this.TotalTasksForYear[3],
              backgroundColor: 'rgba(255, 148, 112, 0.7) ', // darkOrange
              borderColor: 'rgba(255, 148, 112, 1)',
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
              text: 'Completed status of current Year',
              align: 'start',
              font: {
                size: 14,
              },
            },
          },
        }
      });
    } else if (this.selectedOption === 'months') {
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('en-US', { month: 'short' });
      const currentMonthNumber = currentDate.getMonth();
      console.log(this.completedTaskForMonth[3][currentMonthNumber])
      this.myChart = new Chart("myChart", {
        type: 'bar',
        data: {// values on X-Axis
          xLabels: [currentMonth],
          datasets: [
            {
              label: "Completed Tasks",
              data: [this.completedTaskForMonth[3][currentMonthNumber]],
              backgroundColor: 'rgba(255, 148, 112, 0.7) ', // darkOrange
              borderColor: 'rgba(255, 148, 112, 1)',
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
              text: 'Completed Status of current month',
              align: 'start',
              font: {
                size: 14,
              },
            },
          },
        }
      });
    }
  }
}


















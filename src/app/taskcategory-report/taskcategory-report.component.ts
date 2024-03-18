import { AfterViewInit, Component, OnInit, Output } from '@angular/core';
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
import { valueOrDefault } from 'chart.js/dist/helpers/helpers.core';
import { MenuItem } from '../model/MenuItem.model';
import { lastValueFrom } from 'rxjs';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';

@Component({
  selector: 'app-taskcategory-report',
  templateUrl: './taskcategory-report.component.html',
  styleUrls: ['./taskcategory-report.component.css']
})
export class TaskcategoryReportComponent implements OnInit,AfterViewInit {

  @Output() title = 'Task Category Report'
  reportType: string;
  selectedTaskCategory: string;
  taskListByCategoryChart = null;
  taskListByCategoryChart1 = null;

  viewPermission: boolean;
  createPermission: boolean;
  updatePermission: boolean;
  deletePermission: boolean;
  noPermissions: boolean;
  userRoleMenuItemsPermissionMap: Map<string, string>

  async ngOnInit(): Promise<void> {

    if (localStorage.getItem('jwtToken') === null) {
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
        this.getAllTaskCategoryList();
        this.getAllTasksByTaskcategory();
        //this.getAllTasksByCategoryCount();
        setTimeout(() => {
          if (this.reportType === 'all') {
            this.getAllTasksByCategoryCount();
            //this.getchoosenCategory(this.selectedTaskCategory); 
          }
          if (this.reportType != 'all') {
            this.getTaskCategoryId(parseInt(this.valueoftaskCategory))
            this.getchoosenCategory(this.valueoftaskCategory)
          }
        }, 200)

      } else {
        this.viewPermission = false;
      }
      if (menuItemPermissions.includes('Create')) {
        this.createPermission = true;
      } else {
        this.createPermission = false;
      }
      if (menuItemPermissions.includes('Update')) {
        this.updatePermission = true;
      } else {
        this.updatePermission = false;
      }
      if (menuItemPermissions.includes('Delete')) {
        this.deletePermission = true;
      } else {
        this.deletePermission = false;
      }
    } else {
      //this.noPermissions = true;
      this.router.navigateByUrl('/unauthorized');
    }

  }
  valueoftaskCategory: string;
  value: string[]
  constructor(private taskCategoryService: TaskCategoryService, private router: Router, private activatedRoute: ActivatedRoute,
    private taskservice: TaskService, private taskCategoryReportservice: TaskCategoryReport, private menuItemService: AppMenuItemService
  ) {
    this.activatedRoute.queryParams.subscribe(param => {
      this.reportType = param['reportType'];
      this.value = this.reportType.split(',')
      this.valueoftaskCategory = this.value[1]
    })
  }
  ngAfterViewInit(): void {
    //this.InitailizeJqueryDataTable();     
}
Table:any;
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
          "targets": [4],
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
  
  taskCategoryList: TaskCategory[];
  getAllTaskCategoryList() {
    this.taskCategoryService.getAllTaskCategories().subscribe({
      next: response => {
        this.taskCategoryList = response.body;
      }
    })
  }
  taskList: Task[]
  alltasksCount: number;
  getAllTasksByTaskcategory() {
    this.taskservice.getAlltasks().subscribe({
      next: response => {
        this.taskList = response.body;
        this.alltasksCount = response.body.length;
      }
    })
    // if(this.taskListByCategoryChart1 ! = null){
    //   this.taskListByCategoryChart1.destroy()
    //   this.createTaskListAllDepartmentChart()
    // }

  }
  taskListByCategory: Task[]
  categoryOfTaskCount: number;
  selectedtaskCategoryName: string;
  getchoosenCategory(selectedCategory: string) {
    console.log(selectedCategory);
    if(parseInt(this.selectedTaskCategory) > 0 ||selectedCategory != null){
    this.selectedTaskCategory = selectedCategory;
    if (this.taskListByCategoryChart != null) {
      this.taskListByCategoryChart.destroy();

    }
    
    this.getTaskCategoryId(parseInt(this.selectedTaskCategory))
    this.taskCategoryReportservice.getAllTasksByTaskCategoryId(parseInt(this.selectedTaskCategory)).subscribe({
      next: response => {
        this.taskListByCategory = response.body;
        this.categoryOfTaskCount = response.body.length;
        setTimeout(() => {
          this.createTaskListByDepartmentChart();
        }, 400)
      }
    })
  }else{
    this.categoryOfTaskCount = this.alltasksCount;
    if (this.taskListByCategoryChart1 != null) {
       this.taskListByCategoryChart1.destroy();

    }
     window.location.reload();
    this.createTaskListAllDepartmentChart();
  }

  }
  selectedCategoryObject: TaskCategory
  getTaskCategoryId(selectedTaskCategory: number) {
    this.taskCategoryService.getTaskCatgeoryById(selectedTaskCategory).subscribe({
      next: response => {
        if (response.status == HttpStatusCode.Ok) {
          this.selectedCategoryObject = response.body;
          this.selectedtaskCategoryName = this.selectedCategoryObject.taskCategoryTitle;
        }

      }
    })

  }
  taskCategoryCount: TaskCategoryCount[]
  taskObjectString: string[]
  finaltaskCategoryObject: TaskCategoryCount[] = []
  getAllTasksByCategoryCount() {
    this.taskCategoryReportservice.getAllTasksByCategoryCount().subscribe({
      next: response => {
        this.taskCategoryCount = response.body;

        this.taskCategoryCount.forEach(taskCategory1 => {
          var taskCategoryString = (String)(taskCategory1);
          this.taskObjectString = taskCategoryString.split(',')
          var taskCategoryObject = new TaskCategoryCount();
          taskCategoryObject.taskCategoryId = parseInt(this.taskObjectString[0]);
          taskCategoryObject.taskCategoryCount = parseInt(this.taskObjectString[1]);
          this.finaltaskCategoryObject.push(taskCategoryObject);

        })
       this.createTaskListAllDepartmentChart();
        this.getAllTaskCategoryNames();
      }
    })
  }
  getAllTaskCategoryNames() {
    this.getAllTaskCategoryList();
    this.taskCategoryList.forEach(taskCategory => {
      this.finaltaskCategoryObject.map(categoryObject => {
        if (taskCategory.taskCategoryId == categoryObject.taskCategoryId) {
          categoryObject.taskCategoryTitle = taskCategory.taskCategoryTitle;
        }
      })
    })
  }
  type: any = 'line'
  colorOfChartType: any = 'line';
  setChartType(value: any) {
    this.type = value;

    if (this.selectedtaskCategoryName == null) {
      console.log(this.reportType)
      this.colorOfChartType = value;
      if (this.taskListByCategoryChart1 != null) {
        this.taskListByCategoryChart1.destroy();
      }
      this.createTaskListAllDepartmentChart()
    }
    else {
      this.colorOfChartType = value;
      if (this.taskListByCategoryChart != null) {
        this.taskListByCategoryChart.destroy();
      }
      this.createTaskListByDepartmentChart();
    }


  }
  taskByDepartmentData : any[]
  taskByDepartmentXLabels : any[]
  taskCategoryType : string[];
  createTaskListByDepartmentChart() {
    this.taskCategoryType =  this.reportType.split(',')
    if(this.type === 'line'){
      this.taskByDepartmentData = [0,this.categoryOfTaskCount,];
      this.taskByDepartmentXLabels = ['',"Total Task of a category",''];
    }else{
       this.taskByDepartmentData = [this.categoryOfTaskCount];
       this.taskByDepartmentXLabels = ["Total Task of a category"]
    }

    this.taskListByCategoryChart = new Chart("taskListByCategoryChart", {
      type: this.type,
      data: {// values on X-Axis
        xLabels: this.taskByDepartmentXLabels,
        datasets: [
          {
            label: "Total Task of a category",
            data: this.taskByDepartmentData,
            backgroundColor: 'rgba(255, 99, 132, 0.8)', // Red
            // backgroundColor: 'rgb(153, 102, 255)', // Red
            //backgroundColor : 'limegreen',
            borderColor: 'rgba(255, 99, 132, 1)',
            // borderColor :'rgb(153, 102, 255)',
            borderWidth: 1,
          },
        ]

      },
      options: {
        aspectRatio: 2.2,
        scales: {
          x: {
            display: true,
            //stacked: true,
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
            text: 'Total Task of a category',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }
  taskByAllDepartmentData : any[];
  taskByAllDepartmentXLabel : any[];
  createTaskListAllDepartmentChart() {
    if(this.type === 'line'){
       this.taskByAllDepartmentData = [0,this.alltasksCount,];
       this.taskByAllDepartmentXLabel =['','Total Tasks for all category',''];
    }else{
      this.taskByAllDepartmentData = [this.alltasksCount,];
      this.taskByAllDepartmentXLabel =['Total Tasks for all category'];
    }
    this.taskListByCategoryChart1 = new Chart("taskListByCategoryChart1", {
      type: this.type,
      data: {// values on X-Axis
        xLabels: this.taskByAllDepartmentXLabel,
        datasets: [
          {
            label: "Total Tasks for all category",
            data: this.taskByAllDepartmentData,
            backgroundColor: 'rgba(255, 99, 132, 0.8)', // Red
            // backgroundColor: 'rgb(153, 102, 255)', // Red
            //backgroundColor : 'limegreen',
            borderColor: 'rgba(255, 99, 132, 1)',
            // borderColor :'rgb(153, 102, 255)',
            borderWidth: 1,
          },
        ]

      },
      options: {
        aspectRatio: 2.2,
        scales: {
          x: {
            display: true,
            //stacked: true,
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
            text: 'Total Task for all category',
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
    const response = await lastValueFrom(this.menuItemService.findMenuItemByName('Task Category Report')).then(response => {
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

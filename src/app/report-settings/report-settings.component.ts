import { Component, Output, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskCategory } from '../model/TaskCategory.model';
import { TaskCategoryService } from '../task-category/service/task-category.service';
import { MenuItem } from '../model/MenuItem.model';
import { lastValueFrom } from 'rxjs';
import { HttpStatusCode } from '@angular/common/http';
import { AppMenuItemService } from '../app-menu-item/service/app-menu-item.service';
import { EmployeeService } from '../employee/service/employee.service';
import { error } from 'jquery';

@Component({
  selector: 'app-report-settings',
  templateUrl: './report-settings.component.html',
  styleUrls: ['./report-settings.component.css']
})
export class ReportSettingsComponent implements OnInit {
  @Output() title: string = 'Reports'
  reportType: string ;
  taskCategoriesList: TaskCategory [];
  viewPermission: boolean;
  createPermission: boolean;
  updatePermission: boolean;
  deletePermission: boolean;
  noPermissions: boolean;
  userRoleMenuItemsPermissionMap: Map<string, string>
  loggedInUser = localStorage.getItem('email');
  loggedInUserRole = localStorage.getItem('userRole');
  loggedInUserFullName = localStorage.getItem('firstName')+' '+localStorage.getItem('lastName');

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private tastCategory: TaskCategoryService,
    private menuItemService: AppMenuItemService,private employeeService:EmployeeService){

  }

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
    this.hideAllDepartmentChartBasedOnDepHead()
      if (this.userRoleMenuItemsPermissionMap.has(currentMenuItem.menuItemId.toString().trim())) {
        //this.noPermissions = false;
        //provide permission to access this component for the logged in user if view permission exists
        //get permissions of this component for the user
        var menuItemPermissions = this.userRoleMenuItemsPermissionMap.get(this.currentMenuItem.menuItemId.toString().trim());
        if (menuItemPermissions.includes('View')) {
          this.viewPermission = true;
          this.getAllTaskCategories();
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

  setMeetingReportType(reportType: string){
    this.reportType = reportType;
    this.router.navigate(['/meeting-report'],{queryParams:{reportType:reportType}})
  }

  setTaskReportType(reportType: string){
    this.reportType = reportType;
    this.router.navigate(['/task-reports'],{queryParams:{reportType:reportType}})
  }

  setActionItemReportType(reportType: string){
    this.reportType = reportType;
    this.router.navigate(['/actionitem-reports'],{queryParams:{reportType:reportType}})
  }

  getAllTaskCategories(){
    this.tastCategory.getAllTaskCategories().subscribe(
      Response=>{ 
        this.taskCategoriesList = Response.body;
      }
    )

   // this.reportType = reportType;
    //this.router.navigate(['/action-items-reports'])
  }
  setTaskCategoryType(reportType: string, id : number){
    if(reportType == 'all'){
      this.reportType = reportType;
      this.router.navigate(['taskcategory-report'],{queryParams:{reportType:reportType}})
    }
    else{
      this.reportType = reportType;
      this.router.navigate(['taskcategory-report'],{queryParams:{reportType:reportType+','+id}})
    }
    
  }

  currentMenuItem: MenuItem;
  async getCurrentMenuItemDetails() : Promise<MenuItem> {
      const response =  await lastValueFrom(this.menuItemService.findMenuItemByName('Reports')).then(response => {
        if (response.status === HttpStatusCode.Ok) {
          this.currentMenuItem = response.body;
        }else if(response.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      },reason => {
        if(reason.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }
      }
      )
    return this.currentMenuItem;
  }

  departmentList:any;
  hideAllDepartment:boolean=false
  hideAllDepartmentChartBasedOnDepHead(){
    this.employeeService.getUserStatusBasedOnDepartmentHead(this.loggedInUser).subscribe({
      next: response => {
        this.departmentList = response.body;
        if(this.departmentList.length>1){
          this.hideAllDepartment=false
        }else{
          this.hideAllDepartment=true
        }
      },error:error=>{
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      }
    })
  }

}

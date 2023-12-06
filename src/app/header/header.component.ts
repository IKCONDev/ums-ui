import { Component ,Output, Input, SimpleChanges, OnChanges } from '@angular/core';
import {Router} from '@angular/router';
import { HeaderService } from './service/header.service';
import { error } from 'jquery';
import { Employee } from '../model/Employee.model';
import { Users } from '../model/Users.model';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from '../employee/service/employee.service';
import { HttpStatusCode } from '@angular/common/http';
import { NotificationService } from '../notifications/service/notification.service';
import { UserRoleMenuItemPermissionService } from '../user-role-menuitem-permission/service/user-role-menuitem-permission.service';
import { UserRoleMenuItemPermissionMap } from '../model/UserRoleMenuItemPermissionMap.model';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnChanges {

  @Input() title: string;
  authStatusUpdated: number;
  //user/employee profile property
  userDetails: Users;
  reportingManagerName: string;
  @Input() unreadNotificationCount = parseInt(localStorage.getItem('notificationCount'));
  loggedInUserId: string;
  userRoleMenuItemPermissionList: UserRoleMenuItemPermissionMap[];

  /**
   * 
   * @param headerService 
   * @param router 
   */
  constructor(private headerService: HeaderService, private router: Router, 
    private toastr: ToastrService, private employeeService: EmployeeService,
    private notificationService: NotificationService, 
    private userRoleMenuItemPermissionMapService: UserRoleMenuItemPermissionService){

  }

  ngOnChanges(changes: SimpleChanges){
    if(this.unreadNotificationCount != null)
    localStorage.setItem('notificationCount',this.unreadNotificationCount.toString());
  }

  /**
   * 
   */
  async ngOnInit() {
    this.loggedInUserId = localStorage.getItem('email');
    //get users latest permissions
   var userRoleMenuItemPermissionMap = await this.getLatestUserRoleMenuItemPermissionMapofUser();
    console.log(userRoleMenuItemPermissionMap)
    var userRPMJSONMap = JSON.stringify(Object.fromEntries(userRoleMenuItemPermissionMap));
    console.log(userRPMJSONMap)
    localStorage.setItem('userRoleMenuItemPermissionMap',userRPMJSONMap);
    
    this.userProfileDetails();

    //due to this , the userDetails also gets initialized and you can
    setTimeout(()=>{
    // Check if there's a saved state and apply it
    const savedState = localStorage.getItem('sliderState');
    if (savedState) {
      this.userDetails.twoFactorAuthentication = savedState === 'active';
    }
    },1000)
    console.log('header')
  }

 /**
  * 
  * @returns 
  */
  async getLatestUserRoleMenuItemPermissionMapofUser(): Promise<Map<string, string>> {
    await lastValueFrom(this.userRoleMenuItemPermissionMapService.findUserRoleMenuitemPermissionMapsByUserId(this.loggedInUserId)).then(
      response => {
        if(response.status === HttpStatusCode.Ok){
          this.userRoleMenuItemPermissionList = response.body;
          console.log(response.body);
          console.log('exe on init' )
        } else if(response.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
        }
      }, reason => {
        console.log(reason)
      }
    )
    var userRoleMenuItemPermissionMap =  await this.prepareUserRoleMenuItemPermissionMapFromList(this.userRoleMenuItemPermissionList);
    return userRoleMenuItemPermissionMap;
  }

  /**
   * 
   * @param userRoleMenuItemPermissionList 
   * @returns 
   */
  async prepareUserRoleMenuItemPermissionMapFromList(userRoleMenuItemPermissionList: UserRoleMenuItemPermissionMap[]): Promise<Map<string,string>>{
    var userRoleMenuItemPermissionMap = new Map<string, string>();
    userRoleMenuItemPermissionList.forEach(userRPM => {
      userRoleMenuItemPermissionMap.set(userRPM.menuItemIdList, userRPM.permissionIdList);
    })
    return userRoleMenuItemPermissionMap;
  }

  currentState: string = localStorage.getItem('sliderState');

  /**
   * 
   */
  toggleSlider() {
      this.userDetails.twoFactorAuthentication = !this.userDetails.twoFactorAuthentication;
      console.log(this.userDetails.twoFactorAuthentication)
       // Save the state to local storage
      this.currentState = this.userDetails.twoFactorAuthentication ? 'active' : 'inactive';
      localStorage.setItem('sliderState', this.currentState);
      console.log(localStorage.setItem('sliderState', this.currentState));
      //save the updatedauthStatus to db
    this.headerService.updateTwofactorAuthenticationStatus(this.userDetails.twoFactorAuthentication,this.userDetails.email).subscribe(
      (response) =>{
        this.authStatusUpdated = response
        console.log(response)
      }
    )
  }

  /**
   * 
   * @param emailId 
   */
  getEmployee(emailId: string){
    this.employeeService.getEmployee(emailId).subscribe({
      next: reponse => {
        this.reportingManagerName = reponse.body.firstName+" "+reponse.body.lastName;
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      }
    })
  }


  //already we have user profile details after login in localstorage or cookie session object, 
  //still if we want to get the data freshly, get it from DB again
  /**
   * 
   */
  userProfileDetails(): any{
   // console.log(localStorage.getItem('email'));
    this.headerService.fetchUserProfile(localStorage.getItem('email')).subscribe(
      response=>{
        this.userDetails= response.body
        console.log(this.userDetails)
        console.log(this.userDetails.userRoles[0].roleName)
        localStorage.setItem('userRole',this.userDetails.userRoles[0].roleName);
       // localStorage.setItem('userRoleMenuItemsPermissionMap',JSON.parse())
        //get reporting manager of employee
        this.getEmployee(this.userDetails.employee.reportingManager);
      }
    )
   // console.log(this.userDetails.userRoles[0].roleName)
  }

  /**
   * 
   */
  openProfilePanel(){
    this.router.navigateByUrl('/my-profile');
  }

  /**
   * 
   */
  logout(){
    //sessionStorage.clear();
    localStorage.clear();
   // localStorage.setItem('tabOpened','OrganizedMeeting');
    this.toastr.success('Hope you had a great experience','Logged out success')
   // window.localStorage.clear ();
     window.localStorage.clear();
    this.router.navigateByUrl('/login');
  }

  refreshPage(){
    window.location.reload();
  }
  
  // notificationCount(){
  // this.notificationService.getAllNotificationsCountByUserId(localStorage.getItem('email'));
   
  // }
}

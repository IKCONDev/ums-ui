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

  /**
   * 
   * @param headerService 
   * @param router 
   */
  constructor(private headerService: HeaderService, private router: Router, 
    private toastr: ToastrService, private employeeService: EmployeeService,private notificationService: NotificationService){

  }

  ngOnChanges(changes: SimpleChanges){
    localStorage.setItem('notificationCount',this.unreadNotificationCount.toString());
  }

  /**
   * 
   */
  ngOnInit() {
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

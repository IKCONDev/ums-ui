import { Component, OnInit } from '@angular/core';
import { NotificationService } from './service/notification.service';
import { error } from 'jquery';
import { HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { Notification } from '../model/Notification.model';
import { Observable } from 'rxjs';
import { Users } from '../model/Users.model';
import { HeaderService } from '../header/service/header.service';
//import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  notificationList: Notification[];
  notificationCount = 0;
  userDetails : Users;

  constructor(private notificationService: NotificationService,
    private router: Router, private headerService : HeaderService, private cdr :ChangeDetectorRef){
      this.getNotificationsOfUser();
     // this.getAssignedUserProfile('Bharat@ikcontech.com')
  }

  ngOnInit(): void {
    //this.getNotificationsOfUser();
    
  }

  /**
   * 
   */
  getNotificationsOfUser(){
      //get top 10 notifications of user
    this.notificationService.getTopTenNotificationsByUserId(localStorage.getItem('email')).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.notificationList = response.body;
          this.notificationCount = response.body.length;
          localStorage.setItem('notificationCount',this.notificationCount.toString())
          // this.notificationList.forEach(notification => {
          //    console.log(notification.profilepic)
          //    });
          //for each notification set time ago
          // this.notificationList.forEach(notification => {
          //   notification.timeAgoDateTime = new TimeAgo('en-US')
          //   notification.timeAgoDateTime.format(new Date(notification.createdDateTime))
          // });
        }
      },
      error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          //router tosession timeout
          this.router.navigateByUrl('/session-timeout')
        }
      }
    });
  }

  /**
   * 
   */
  updateNotificationStatus(notification: Notification){
    if(notification.status === 'Unread'){
      this.notificationService.updateNotification(notification).subscribe({
        next: response => {
          if(response.status === HttpStatusCode.PartialContent){
          }
        },error: error => {
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }
        }
      })
    }
    
  }
  getAssignedUserProfile(email : string){
    this.headerService.fetchUserProfile(email).subscribe({
      next : response =>{
        this.userDetails = response.body;
      }

    })

  }
  getProfilePicUrl(profilePic: string): string {
     try {
      //Assuming profilePic is a valid Base64 string
      return 'data:image/jpg;base64,'+ profilePic;
     } catch (error) {
       console.error('Error creating profile pic URL:', error);
          return ''; // or a default URL
     }
  }
 
}

import { Component, OnInit } from '@angular/core';
import { NotificationService } from './service/notification.service';
import { error } from 'jquery';
import { HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { Notification } from '../model/Notification.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  notificationList: Observable<Notification[]>;
  notificationCount = 0;

  constructor(private notificationService: NotificationService,
    private router: Router){
      this.getNotificationsOfUser();
  }

  ngOnInit(): void {
    
  }

  /**
   * 
   */
  getNotificationsOfUser(){
      //get top 10 notifications of user
    this.notificationService.getTopTenNotificationsByUserId(localStorage.getItem('email')).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.notificationList = new Observable(observer => {
            setInterval(() => {
              observer.next(response.body);
            },1000)
          })
          this.notificationCount = response.body.length;
          console.log(this.notificationCount);
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
            console.log(response.body)
          }
        },error: error => {
          if(error.status === HttpStatusCode.Unauthorized){
            this.router.navigateByUrl('/session-timeout');
          }
        }
      })
    }
    
  }

}

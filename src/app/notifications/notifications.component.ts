import { Component } from '@angular/core';
import { NotificationService } from './service/notification.service';
import { error } from 'jquery';
import { HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { Notification } from '../model/Notification.model';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent {

  notificationList: Notification[];
  notificationCount = 0;

  constructor(private notificationService: NotificationService,
    private router: Router){
      this.getNotificationsOfUser();
  }

  /**
   * 
   */
  getNotificationsOfUser(){
    this.notificationService.getTopTenNotificationsByUserId(localStorage.getItem('email')).subscribe({
      next: response => {
        if(response.status === HttpStatusCode.Ok){
          this.notificationList = response.body
          this.notificationCount = this.notificationList.length;
          console.log(this.notificationCount);
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

}

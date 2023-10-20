import { Component, Input, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { HomeService } from './service/home.service';
import { outputAst } from '@angular/compiler';
import { SideMenubarComponent } from '../side-menubar/side-menubar.component';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

 title: string = 'Overview';
 organizedMeetingsCount:string = localStorage.getItem('totalMeetingsOrganized');
 attendedMeetingsCount: string = localStorage.getItem('attenedMeetingsCount');
 actionItemsCount: number = 0;
 organizedTasksCount: number = 0;
 assignedTasksCount: number = 0;

 loginDetails = {
  firstName:'',
  token: '',
  userId: '',
  userRole: '',
  userData: ''
}
  
  //get the latest selected component on page load /refresh
  //selectedOption:string = localStorage.getItem('selectedComponent');
  //title:string = localStorage.getItem('title');

  /**
   * 
   * @param router 
   * @param homeService 
   */
  constructor(private router: Router, private homeService:HomeService,
    ){
    let loginInfo = {
      firstName: '',
      token: '',
      userId: '',
      userRole: '',
      userData: ''
    }

    //get Navigation extras , collect from router object
    if(this.router.getCurrentNavigation().extras.state){
      loginInfo = this.router.getCurrentNavigation().extras.state['loginInfo'];
      console.log(this.router.getCurrentNavigation().extras.state['loginInfo'])
      this.loginDetails = loginInfo
    }
  }

   /**
     * get user organized meetings count
     */
   getUserorganizedMeetingCount(){
    this.homeService.getUserorganizedMeetingCount().subscribe({
      next:(response)=>{
        this.organizedMeetingsCount = response.body.toString();
        console.log(this.organizedMeetingsCount)
        localStorage.setItem('totalMeetingsOrganized',response.body.toString())
      },error: (error) =>{
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }
      }
      })
   }

  /**
     * get User attended meetings count
     */
  getUserAttendedMeetingCount(){
    this.homeService.getUserAttendedMeetingCount().subscribe({
      next: (response)=>{
        this.attendedMeetingsCount = response.body.toString();
        console.log(this.attendedMeetingsCount);
        localStorage.setItem('attenedMeetingsCount',response.body.toString());
      },error: (error) =>{
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout')
        }
      }
    })
  }

  /**
   * 
   */
  ngOnInit(): void {
    //get all counts and display in home/overview poge
    this.getUserorganizedMeetingCount();
    this.getUserOrganizedActionItemsCount();
    this.getUserAssignedTasksCount();
    this.getUserOrganizedTasksCount();
    this.getUserAttendedMeetingCount();
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


  /**
   * 
   */
  getUserOrganizedActionItemsCount(){
    this.homeService.getActionItemsCountByUserId().subscribe({
      next: response =>{
        this.organizedTasksCount = response.body;
        console.log(response.body);
      }
    })
  }

/**
 * 
 */
  getUserOrganizedTasksCount(){
    this.homeService.getActionItemsCountByUserId().subscribe({
      next: response =>{
        this.assignedTasksCount = response.body;
        console.log(response.body);
      }
    })
  }

  /**
   * 
   */
  getUserAssignedTasksCount(){
    this.homeService.getActionItemsCountByUserId().subscribe({
      next: response =>{
        this.actionItemsCount = response.body;
        console.log(response.body);
      }
    })
  }

}

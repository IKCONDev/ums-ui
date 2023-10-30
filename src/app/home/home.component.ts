import { Component, Input, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { HomeService } from './service/home.service';
import { outputAst } from '@angular/compiler';
import { SideMenubarComponent } from '../side-menubar/side-menubar.component';
import { HttpStatusCode } from '@angular/common/http';
import { HeaderService } from '../header/service/header.service';
import { error } from 'jquery';
import { Chart, registerables } from 'chart.js';
import { Meeting } from '../model/Meeting.model';
Chart.register(...registerables);




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
  constructor(private router: Router, private homeService:HomeService,private headerService: HeaderService
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
    //get employeedetails
    this.headerService.fetchUserProfile(localStorage.getItem('email')).subscribe({
      next: response =>{
        localStorage.setItem('firstName',response.body.employee.firstName);
        localStorage.setItem('lastName', response.body.employee.lastName);
        console.log(response)
        console.log(localStorage.getItem('lastName'))
      }
    });
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
    this.createChart();
    
    

  
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
        this.actionItemsCount = response.body;
        console.log(response.body);
      }
    })
  }

/**
 * 
 */
  getUserOrganizedTasksCount(){
    this.homeService.getOrganizedTasksCountByUserId().subscribe({
      next: response =>{
        this.organizedTasksCount = response.body;
        console.log(response.body);
      }
    })
  }

  /**
   * 
   */
  getUserAssignedTasksCount(){
    this.homeService.getAssignedTasksCountByUserId().subscribe({
      next: response =>{
        this.assignedTasksCount = response.body;
        console.log(response.body);
      }
    })
  }
  
  createChart(){
    var myChart = new Chart("myChart", {
      type: 'bar',
      data: {// values on X-Axis
        labels: ['Monday','Tuesday' ,'Wednesday','Thursday','Friday','Saturday','Sunday'], 
	       datasets: [
          {
            label: "Asigned Task",
            data: ['600','576', '572', '679', '92'
								 ],
            backgroundColor: 'blue'
          },
          {
            label: "Inprogress Task",
            data: ['42', '42', '36', '27', '17'],
            backgroundColor: 'pink'
          },
          {
            label: "Completed Task",
            data: ['542', '542', '536', '327', '17'],
            backgroundColor: 'limegreen'
          }  

        ]
        
      },
      options: {
        aspectRatio:2.5
        
      }
      
    });
  }
  
  


}

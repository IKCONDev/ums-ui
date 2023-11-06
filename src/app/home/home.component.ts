import { Component, Input, OnChanges, OnInit } from '@angular/core';
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
Chart.register(...registerables);




@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit{

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
  selectedOption:string;
  selectedOption2:string;
  onSelectChange(){
    console.log("entered onselect change")
    if(this.selectedOption==='Week'){
      this.fetchTaskStatus();
    }
    
  }
  onSelectChange2(){
    console.log("entered onselect change")
    if(this.selectedOption2==='Week'){
      this.fetchTaskStatus2();
    }
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
    this.selectedOption="Week";
    this.selectedOption2="Week";
    this.onSelectChange();
    this.onSelectChange2();
    
    

  
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
  
  TotalTasks:any[];
  
  fetchTaskStatus(){
      console.log("entered the fetch details of task")
      const currentDate=new Date();
      const startDate=new Date(currentDate);
      startDate.setHours(0,0,0,0);
      startDate.setDate(currentDate.getDate()-currentDate.getDay())
      const endDate = new Date();
      endDate.setDate(startDate.getDate()+6);//end of the week
      endDate.setHours(23,59,59,999);//end of the day
      console.log(startDate);
      console.log(endDate);

      this.homeService.fetchStatusforWeek(startDate.toISOString(),endDate.toISOString()).subscribe({
        next: response =>{
        this.TotalTasks=response.body;
        console.log(this.TotalTasks)
        
        this.createChart();
        
        }
      })

      
      

    }
    TotalMeetingStatus:any[];
    fetchTaskStatus2(){
      console.log("entered the fetch details of meetings")
      const currentDate=new Date();
      const startDate=new Date(currentDate);
      startDate.setHours(0,0,0,0);
      startDate.setDate(currentDate.getDate()-currentDate.getDay())
      const endDate = new Date();
      endDate.setDate(startDate.getDate()+6);//end of the week
      endDate.setHours(23,59,59,999);//end of the day
      console.log(startDate.toISOString());
      console.log(startDate.toString())
      console.log(endDate);


    this.homeService.fetchMeetingStatusforWeek(startDate.toISOString(),endDate.toISOString()).subscribe({
      next:response=>{
        console.log(response);
        this.TotalMeetingStatus=response.body;
        console.log(this.TotalMeetingStatus[0]);
        console.log(this.TotalMeetingStatus[1]);
        console.log(this.TotalMeetingStatus[2]);
        console.log(this.TotalMeetingStatus[3]);
        console.log(this.TotalMeetingStatus[4]);
        console.log(this.TotalMeetingStatus[5]);
        console.log(this.TotalMeetingStatus[6]);
        
        this.createChart2();
      
      }
    })
  }
   

  createChart(){
    
    var myChart = new Chart("myChart", {
      type: 'bar',
      data: {// values on X-Axis
        labels: ['Sun','Mon','Tue' ,'Wed','Thu','Fri','Sat'], 
	       datasets: [
          {
            label: "Assigned Task",
            data: this.TotalTasks[0],
            backgroundColor: 'rgba(255, 99, 132, 0.8)', // Red
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 3,
          },
          {
            label: "Inprogress Task",
            data: this.TotalTasks[1],
            backgroundColor: 'rgba(255, 206, 86, 0.8)', // Yellow
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 3,
        },
        {
          label: "Completed Task",
          data: this.TotalTasks[2],
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
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              font: {
                size: 12,
              },
            },
          },
          title: {
            display: true,
            text: 'Meeting Status by Day of the Week',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  
  }
  
  


  createChart2(){
    var myChart2 = new Chart("myChart2", {
      type: 'bar',
      data: {// values on X-Axis
        labels: ['Sun','Mon','Tue' ,'Wed','Thu','Fri','Sat'], 
	       datasets: [
          {
            label: "Organised Meetings",
            data: this.TotalMeetingStatus[1],
            backgroundColor: 'blue'
          },
          {
            label: "Attended Meetings",
            data: this.TotalMeetingStatus[0],
            backgroundColor: 'pink'
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
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              font: {
                size: 12,
              },
            },
          },
          title: {
            display: true,
            text: 'Meeting Status by Day of the Week',
            font: {
              size: 14,
            },
          },
        },
      }
    });
     
  }
}








  




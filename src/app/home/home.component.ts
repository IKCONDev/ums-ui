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

 loggedInUserRole = localStorage.getItem('userRole');
 title: string = 'Overview';
 organizedMeetingsCount:string; 
 attendedMeetingsCount: string;
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
    }else if(this.selectedOption==='months'){
      this.fetchTaskStatus();
    }
    
  }
  onSelectChange2(){
    console.log("entered onselect change")
    if(this.selectedOption2==='Week'){
      this.fetchTaskStatus2();
    }else if(this.selectedOption2==='months'){
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
       // localStorage.setItem('totalMeetingsOrganized',response.body.toString())
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
        //localStorage.setItem('attenedMeetingsCount',response.body.toString());
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
    if(this.selectedOption!='months'){
   this.selectedOption="Week";
    }
    if(this.selectedOption2!='months'){
      this.selectedOption2="Week";
       }
    
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
  TotalTasksForYear:any[];
  
  fetchTaskStatus(){
    if(this.selectedOption==='Week'){
      if(this.myChart!=null){
      this.myChart.destroy();
      }
      console.log("entered the fetch details of task")
      const currentDate=new Date();
      const startDate=new Date(currentDate);
      startDate.setDate(currentDate.getDate()-currentDate.getDay())
      const endDate = new Date();
      endDate.setDate(startDate.getDate()+6);//end of the week
      console.log(startDate);
      console.log(endDate);

      this.homeService.fetchStatusforWeek(startDate.toLocaleDateString(),endDate.toLocaleDateString()).subscribe({
        next: response =>{
        this.TotalTasks=response.body;
        console.log(this.TotalTasks)
        this.createChart(); 
        }
      })
    }
    else if(this.selectedOption==='months'){
      if(this.myChart!=null){
        this.myChart.destroy();
        }
        const startDate=new Date();
        const endDate=new Date();
        //add dynamic year
        startDate.setFullYear(new Date().getFullYear(),0,1);
        endDate.setFullYear(new Date().getFullYear(),11,31);
        console.log(startDate);
        console.log(endDate);
        this.homeService.fetchTaskStatusForYear(startDate.toLocaleDateString(),endDate.toLocaleDateString()).subscribe({
          next: response =>{
            console.log("entered the else if of fetchTask for year")
            this.TotalTasksForYear=response.body;
            console.log(this.TotalTasksForYear)
            this.createChart(); 
            }
          })
        
    }

    }
    TotalMeetingStatus:any[];
    TotalMeetingStatusForYear:any[];
    fetchTaskStatus2(){
      if(this.myChart2!=null){
        this.myChart2.destroy();
        }
      if(this.selectedOption2==='Week'){
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
        this.createChart2();
      
      }
    })
  }else if(this.selectedOption2==='months'){
    if(this.myChart2!=null){
      this.myChart2.destroy();
      }
    const startDate=new Date();
    const endDate=new Date();

    startDate.setFullYear(2023,0,1);
    startDate.setHours(0,0,0,0);
    
    endDate.setFullYear(2023,11,31);
    endDate.setHours(23,59,59,999);
    console.log(startDate+" "+endDate);
    this.homeService.fetchMeetingStatusForYear(startDate.toISOString(),endDate.toISOString()).subscribe({
      next: response =>{
        console.log("entered the else if of fetchmeetings fo year")
        this.TotalMeetingStatusForYear=response.body;
        console.log(this.TotalMeetingStatusForYear)
        this.createChart2(); 
        }
      })
    

}

    
  }
   
  myChart=null;
  createChart(){
    if(this.selectedOption==='Week'){
     this.myChart = new Chart("myChart", {
      type: 'bar',
      data: {// values on X-Axis
        xLabels: ['Sun','Mon','Tue' ,'Wed','Thu','Fri','Sat'],
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
              display: true,
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align:'center',
            labels: {
              usePointStyle: true,
              font: {
                size: 12,
              },
              padding: 16,
              pointStyle:'rectRounded',
          
            },
          },
          title: {
            display: true,
            text: 'Task Status of current Week',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  }else if(this.selectedOption==='months'){
     this.myChart = new Chart("myChart", {
      type: 'bar',
      data: {// values on X-Axis
        xLabels: ['Jan','Feb','Mar' ,'Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
	       datasets: [
          {
            label: "Assigned Task",
            data: this.TotalTasksForYear[0],
            backgroundColor: 'rgba(255, 99, 132, 0.8)', // Red
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 3,
          },
          {
            label: "Inprogress Task",
            data: this.TotalTasksForYear[1],
            backgroundColor: 'rgba(255, 206, 86, 0.8)', // Yellow
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 3,
        },
        {
          label: "Completed Task",
          data: this.TotalTasksForYear[2],
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
              display: true,
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align:'center',
            labels: {
              usePointStyle: true,
              font: {
                size: 12,
              },
              padding: 16,
              pointStyle:'rectRounded',
          
            },
          },
          title: {
            display: true,
            text: 'Task Status of current Year',
            align:'start',
            font: {
              size: 14,
            },
          },
        },
      }
    });
  
}
  
  
  }
  myChart2=null
  createChart2() {
    if (this.selectedOption2 === 'Week') {
      var dayColors = ['mistyrose', 'lightsteelblue', 'palegreen', 'lightcoral', 'thistle', 'lightsalmon', 'mediumseagreen'];

      this.myChart2 = new Chart("myChart2", {
        type: 'pie',
        data: {
          labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          datasets: [
            {
              label: "Organised Meetings",
              data: this.TotalMeetingStatus[1],
              backgroundColor: dayColors,
              
              borderWidth: 1.5,
            },
            {
              label: "Attended Meetings",
              data: this.TotalMeetingStatus[0],
              backgroundColor: dayColors,
              
              borderWidth: 1.5,
            }
          ]
        },
        options: {
          aspectRatio: 1.7,
          scales: {
            x: {
              display: false,
            },
            y: {
              display: false,
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'right',
              align:'end',
              labels: {
                usePointStyle: true,
                font: {
                  size: 14,
                },
                padding: 16,
                pointStyle:'rectRounded',
            
              },
            },
            title: {
              display: true,
              text: '   Meeting Status of Current Week',
              align: 'start',
              font: {
                size: 14,
              },
            },
          },
          elements: {
            arc: {
              borderRadius:3,
              borderWidth: 2,
              borderAlign:'inner' // Set the border width for pie chart segments
            },
          },
        }
      });
    }  if (this.selectedOption2 === 'months') {
      var mildColors = [
        'lavender', 'lightcyan', 'lightcoral', 'lightseagreen', 'lightpink', 'lightslategray',
        'mistyrose', 'lightgoldenrodyellow', 'lightseashell', 'lightblue', 'lightgreen', 'lightsteelblue'
      ];
      
      this.myChart2 = new Chart("myChart2", {
        type: 'pie',
        data: {
          labels: ['Jan','Feb','Mar' ,'Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
          datasets: [
            {
              label: "Organised Meetings",
              data: this.TotalMeetingStatusForYear[1],
              backgroundColor: mildColors,
              
              borderWidth: 1.5,
            },
            {
              label: "Attended Meetings",
              data: this.TotalMeetingStatusForYear[0],
              backgroundColor: mildColors,
              
              borderWidth: 1.5,
            }
          ]
        },
        options: {
          aspectRatio: 1.7,
          scales: {
            x: {
              display: false,
            },
            y: {
              display: false,
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'right',
              align:'end',
              labels: {
                usePointStyle: true,
                font: {
                  size: 12,
                },
                padding: 16,
                pointStyle:'rectRounded',
            
              },
            },
            title: {
              display: true,
              text: '   Meeting Status of Current Year',
              align: 'start',
              font: {
                size: 14,
              },
            },
          },
          elements: {
            arc: {
              borderRadius:3,
              borderWidth: 2,
              borderAlign:'inner' // Set the border width for pie chart segments
            },
          },
        }
      });
    }
  }
}
  
  
  
  









  




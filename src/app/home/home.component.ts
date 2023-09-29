import { Component, Input } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { HomeService } from './service/home.service';
import { outputAst } from '@angular/compiler';
import { SideMenubarComponent } from '../side-menubar/side-menubar.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent {


  loginDetails = {
    firstName:'',
    token: '',
    userId: '',
    userRole: '',
    userData: ''
  }

 title: string = 'Overview';
 organizedMeetingsCount:string = localStorage.getItem('totalMeetingsOrganized');
 attendedMeetingsCount: string = localStorage.getItem('attenedMeetingsCount');
  
  //get the latest selected component on page load /refresh
  //selectedOption:string = localStorage.getItem('selectedComponent');
  //title:string = localStorage.getItem('title');

  constructor(private router: Router, private homeService:HomeService,
    ){

    let loginInfo = {
      firstName: '',
      token: '',
      userId: '',
      userRole: '',
      userData: ''
    }

    if(this.router.getCurrentNavigation().extras.state){
      loginInfo = this.router.getCurrentNavigation().extras.state['loginInfo'];
      console.log(this.router.getCurrentNavigation().extras.state['loginInfo'])
      this.loginDetails = loginInfo
    }

    homeService.getUserorganizedMeetingCount().subscribe(
      (response=>{
        this.organizedMeetingsCount = response.toString();
        console.log(this.organizedMeetingsCount)
        localStorage.setItem('totalMeetingsOrganized',response.toString())
      })
    )

    homeService.getUserAttendedMeetingCount().subscribe(
      (response=>{
        this.attendedMeetingsCount = response.toString();
        console.log(this.attendedMeetingsCount);
        localStorage.setItem('attenedMeetingsCount',response.toString());
      })
    )

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

  text:String = "";

  /*
  checkDemo(){
    this.homeService.getDemoText().subscribe(
      (response) => {
        this.text = response
      }
    )
  }
  */

}

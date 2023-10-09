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

    /**
     * get user organized meetings
     */
    homeService.getUserorganizedMeetingCount().subscribe(
      (response=>{
        this.organizedMeetingsCount = response.body.toString();
        console.log(this.organizedMeetingsCount)
        localStorage.setItem('totalMeetingsOrganized',response.body.toString())
      })
    )

    /**
     * get User attended meetings
     */
    homeService.getUserAttendedMeetingCount().subscribe(
      (response=>{
        this.attendedMeetingsCount = response.body.toString();
        console.log(this.attendedMeetingsCount);
        localStorage.setItem('attenedMeetingsCount',response.body.toString());
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

}

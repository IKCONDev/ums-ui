import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { HomeService } from './service/home.service';

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

  constructor(private router: Router, private homeService:HomeService){
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
      console.log('home')
      console.log(this.loginDetails);
    }
  }

  text:String = "";
  checkDemo(){
    this.homeService.getDemoText().subscribe(
      (response) => {
        this.text = response
      }
    )
  }

}

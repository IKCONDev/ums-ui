import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { HomeService } from './service/home.service';
import { outputAst } from '@angular/compiler';

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

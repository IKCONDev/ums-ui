import { Component, Output, Input } from '@angular/core';
import { HeaderService } from './service/header.service';
import { error } from 'jquery';
import { Employee } from '../model/Employee.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent {

  @Input() title: string;
  authStatusUpdated: number;
  //user/employee profile property
  employeeDetails: Employee;
  constructor(private headerService: HeaderService){

  }

  ngOnInit() {
    this.userProfileDetails();

    //due ti this , the userDetails also gets initialized and you can
    setTimeout(()=>{
    // Check if there's a saved state and apply it
    const savedState = localStorage.getItem('sliderState');
    if (savedState) {
      this.employeeDetails.twoFactorAuthentication = savedState === 'active';
    }
    },1000)
    
  }

  toggleSlider() {
      this.employeeDetails.twoFactorAuthentication = !this.employeeDetails.twoFactorAuthentication;
       // Save the state to local storage
      const currentState = this.employeeDetails.twoFactorAuthentication ? 'active' : 'inactive';
      localStorage.setItem('sliderState', currentState);

      //save the updatedauthStatus to db
    this.headerService.updateTwofactorAuthenticationStatus(this.employeeDetails.twoFactorAuthentication,this.employeeDetails.email).subscribe(
      (response) =>{
        this.authStatusUpdated = response
        console.log(response)
      }
    )
  }


  //already we have user profile details after login in localstorage or cookie session object, 
  //still if we want to get the data freshly, get it from DB again
  userProfileDetails(): any{
   // console.log(localStorage.getItem('email'));
    this.headerService.fetchUserProfile(localStorage.getItem('email')).subscribe(
      response=>{
        this.employeeDetails= response.body
        console.log(this.employeeDetails)
      }
    )
  }
}

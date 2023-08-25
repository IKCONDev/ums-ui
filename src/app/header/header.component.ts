import { Component } from '@angular/core';
import { HeaderService } from './service/header.service';
import { error } from 'jquery';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent {

  userDetails :{
    id:number,
    firstName:string,
    lastName:string,
    designation:string,
    department:string,
    email:string,
    userRole:string,
    twoFactorAuthentication: boolean
  }

  constructor(private headerService: HeaderService){

  }

  ngOnInit() {
    this.userProfileDetails();

    //due ti this , the userDetails also gets initialized and you can
    setTimeout(()=>{
    // Check if there's a saved state and apply it
    const savedState = localStorage.getItem('sliderState');
    if (savedState) {
      this.userDetails.twoFactorAuthentication = savedState === 'active';
    }
    },1000)
    
  }

  authStatusUpdated: number;

  toggleSlider() {
      this.userDetails.twoFactorAuthentication = !this.userDetails.twoFactorAuthentication;
       // Save the state to local storage
      const currentState = this.userDetails.twoFactorAuthentication ? 'active' : 'inactive';
      localStorage.setItem('sliderState', currentState);

      //save the updatedauthStatus to db
    this.headerService.updateTwofactorAuthenticationStatus(this.userDetails.twoFactorAuthentication,this.userDetails.email).subscribe(
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
        this.userDetails= response.body
        console.log(this.userDetails)
      }
    )
  }
}

import { Component ,Output, Input } from '@angular/core';
import {Router} from '@angular/router';
import { HeaderService } from './service/header.service';
import { error } from 'jquery';
import { Employee } from '../model/Employee.model';
import { Users } from '../model/Users.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent {

  @Input() title: string;
  authStatusUpdated: number;
  //user/employee profile property
  userDetails: Users;

  /**
   * 
   * @param headerService 
   * @param router 
   */
  constructor(private headerService: HeaderService, private router: Router){

  }

  /**
   * 
   */
  ngOnInit() {
    this.userProfileDetails();

    //due to this , the userDetails also gets initialized and you can
    setTimeout(()=>{
    // Check if there's a saved state and apply it
    const savedState = localStorage.getItem('sliderState');
    if (savedState) {
      this.userDetails.twoFactorAuthentication = savedState === 'active';
    }
    },1000)
    
  }

  currentState: string = localStorage.getItem('sliderState');

  /**
   * 
   */
  toggleSlider() {
      this.userDetails.twoFactorAuthentication = !this.userDetails.twoFactorAuthentication;
       // Save the state to local storage
      this.currentState = this.userDetails.twoFactorAuthentication ? 'active' : 'inactive';
      localStorage.setItem('sliderState', this.currentState);

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
  /**
   * 
   */
  userProfileDetails(): any{
   // console.log(localStorage.getItem('email'));
    this.headerService.fetchUserProfile(localStorage.getItem('email')).subscribe(
      response=>{
        this.userDetails= response.body
        console.log(this.userDetails)
      }
    )
  }

  /**
   * 
   */
  openProfilePanel(){
    this.router.navigateByUrl('/my-profile');
  }

  /**
   * 
   */
  logout(){
    //sessionStorage.clear();
    //localStorage.clear();
   // window.localStorage.clear ();
    this.router.navigateByUrl('/login');
  }
}

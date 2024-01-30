import { Component } from '@angular/core';
import { ForgotPasswordEmailVerificationService } from '../forgot-password-email-verification/service/forgot-password-email-verification.service';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NavigationExtras } from '@angular/router';
import { TwofactorAuthenticationService } from './service/twofactor-authentication.service';

@Component({
  selector: 'app-twofactor-authentication',
  templateUrl: './twofactor-authentication.component.html',
  styleUrls: ['./twofactor-authentication.component.css']
})
export class TwofactorAuthenticationComponent {

  type:string = ''
  result:number = 0;
  //loginInfo:{}
  email:string = ''
  typeError: boolean =true;
  jwtToken : string = null;

  /**
   * 
   * @param emailVerificationService 
   * @param router 
   * @param toastr 
   */
  constructor(private twofactorAuthService: TwofactorAuthenticationService,
    private router: Router, private toastr: ToastrService){
      //get email from current navigation (this is provided while navigating from pervious page)
      this.email = this.router.getCurrentNavigation().extras.state['loginInfo'].email;
      this.jwtToken = this.router.getCurrentNavigation().extras.state['loginInfo'].token;
      localStorage.removeItem("countPageRefresh1")
  }

  /**
   * 
   * @param event 
   */
  setAuthType(event: any){
    this.type = event.target.value;
    if(this.type == ''){
      this.typeError = true;
    }else{
      this.typeError = false;
    }
  }


  /**
   * 
   */
  constructOtp() {
    this.typeError=true;
    this.twofactorAuthService.generateTfOtpForUser(this.email,'TwoFactorAuth').subscribe(
      (response) => {
        this.result = response;
        if (this.result > 0) {
          this.toastr.success("OTP has been sent to your email");
          
          let navigationExtras: NavigationExtras = {
            state: {
              email: this.email,
              jwtToken: this.jwtToken
            }
          }
          this.router.navigate(['/verify-twostep'], navigationExtras);
        } else {
          this.router.navigateByUrl("/two-step");
        }
      }
    )
  }

}

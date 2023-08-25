import { Component } from '@angular/core';
import { ForgotPasswordEmailVerificationService } from '../forgot-password-email-verification/service/forgot-password-email-verification.service';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NavigationExtras } from '@angular/router';

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

  constructor(private emailVerificationService: ForgotPasswordEmailVerificationService,
    private router: Router, private toastr: ToastrService){
      //get email from current navigation (this is provided while navigating from pervious page)
      this.email = this.router.getCurrentNavigation().extras.state['loginInfo'].email;
  }

  setAuthType(event: any){
    this.type = event.target.value;
    if(this.type == ''){
      this.typeError = true;
    }else{
      this.typeError = false;
    }
  }

  constructOtp() {
    console.log(this.email)
    this.emailVerificationService.generateOtpForUser(this.email).subscribe(
      (response) => {
        this.result = response;
        console.log(this.result)
        if (this.result > 0) {
          console.log('an otp has been sent to your e-mail ' + this.result);
          this.toastr.success("OTP has been sent to your email");
          let navigationExtras: NavigationExtras = {
            state: {
              email: this.email
            }
          }
          this.router.navigate(['/verify-twostep'], navigationExtras);
        } else {
          console.log('couldnt generate otp please try again or check your email address')
          this.router.navigateByUrl("/two-step");
        }
      }
    )
  }

}

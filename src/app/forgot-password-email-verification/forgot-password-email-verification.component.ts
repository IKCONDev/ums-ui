import { Component, ElementRef, Renderer2 } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ForgotPasswordEmailVerificationService } from './service/forgot-password-email-verification.service';
import { error } from 'jquery';
import { ToastrService } from 'ngx-toastr';
import { KeyCode } from '@ng-select/ng-select/lib/ng-select.types';
import { PasswordGrantConstants } from '@azure/msal-common';

@Component({
  selector: 'app-forgot-password-email-verification',
  templateUrl: './forgot-password-email-verification.component.html',
  styleUrls: ['./forgot-password-email-verification.component.css']
})

export class ForgotPasswordEmailVerificationComponent {

  email: string = ''
  private destroy$: Subject<void> = new Subject<void>();
  value: number;
  verificationResponse: string;
  isError: boolean = true;
  result: number;

  constructor(private router: Router, private elementRef: ElementRef, private renderer: Renderer2,
    private emailVerificationService: ForgotPasswordEmailVerificationService, private toastr: ToastrService) {
  }

  ngOnInit() {
    console.log('init-Login')
    $(document).ready(function () {
      $('#emailLabel').hide();
      $('#passwordLabel').hide();
    });
  }

  setupEmailInputPlaceholder(): void {
    const emailInput = this.elementRef.nativeElement.querySelector('#email');

    // On click, set the placeholder to an empty string 
    this.renderer.setAttribute(emailInput, 'placeholder', '');
    this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#emailLabel'), 'display', 'block');
    this.renderer.addClass(this.elementRef.nativeElement.querySelector('#emailDiv'), 'group');

    // Add a click event listener to the body 
    this.renderer.listen('body', 'click', (event: MouseEvent) => {
      if (!emailInput.contains(event.target)) {

        // Execute when the focus is outside the textbox 
        this.renderer.setAttribute(emailInput, 'placeholder', 'Email Id');
        console.log('Focus is outside the textbox');
        this.renderer.removeClass(this.elementRef.nativeElement.querySelector('#emailDiv'), 'group');
        this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#emailLabel'), 'display', 'none');
      }
    });
  }

  
  setUserEmail(event: any) {
    this.isError = true;
    this.email = event.target.value;
    console.log(this.email);
    var emailRegExp =  /^[A-Za-z0-9._]{2,30}[0-9]{0,9}@[A-Za-z]{3,12}[.]{1}[A-Za-z.]{3,6}$/;
    if(emailRegExp.test(this.email)){
      this.emailVerificationService.VerifyEmailAddress(this.email).subscribe(
        (response) => {
          this.value = response;
          console.log("the result is:" + this.value);
          if (this.value == 1) {
            console.log("Entered email id is a valid one");
            this.verificationResponse = "";
            this.isError=false;
            this.verificationResponse = "Email Id exists";
          }else {
            console.log("Entered email address is not a registred email address");
            this.isError = true;
            this.verificationResponse = "Incorrect Email Id";
          }
        },
        (error: any) => {
          this.verificationResponse = "";
          this.isError = false;
        }
      )
    }else{
      if(this.verificationResponse==="Email Id exists"){
        this.verificationResponse="Incorrect Email Id"
      }else{
        this.verificationResponse="";
      }
    }
  }

  constructOtp() {
    this.emailVerificationService.generateOtpForUser(this.email,'ForgotPassword').subscribe(
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
          this.router.navigate(['/verify-otp'], navigationExtras);
        } else {
          console.log('couldnt generate otp please try again or check your email address')
          this.router.navigateByUrl("/verify-email");
        }
      }
    )
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


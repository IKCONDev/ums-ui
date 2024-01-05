import { Component, ElementRef, Renderer2 } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Subject, fromEvent } from 'rxjs';
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
  subscription: any;

  /**
   * 
   * @param router 
   * @param elementRef 
   * @param renderer 
   * @param emailVerificationService 
   * @param toastr 
   */
  constructor(private router: Router, private elementRef: ElementRef, private renderer: Renderer2,
    private emailVerificationService: ForgotPasswordEmailVerificationService, private toastr: ToastrService) {
      localStorage.removeItem("countPageRefresh")
  }

  /**
   * 
   */
  ngOnInit() {
    console.log('init-Login')
    $(document).ready(function () {
      $('#emailLabel').hide();
      $('#passwordLabel').hide();
    });
    history.pushState(null, null, location.href);

   this.subscription = fromEvent(window, 'popstate').subscribe(_ => {
      history.pushState(null, null, location.href);
   });
  }

  /**
   * 
   */
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
        //this.renderer.removeClass(this.elementRef.nativeElement.querySelector('#emailDiv'), 'group');
        //this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#emailLabel'), 'display', 'none');
      }
    });
  }

  
  /**
   * 
   * @param event 
   */
  setUserEmail(event: any) {
    this.isError = true;
    this.email = event.target.value;
    console.log(this.email);
    if(this.email.length===0){
      this.disableGetOtp=false;
    }else    
    this.disableGetOtp=true;
    
    var emailRegExp = /^[A-Za-z0-9._]{2,30}[0-9]{0,9}@[A-Za-z]{3,12}[.]{1}[A-Za-z.]{3,6}$/;
    console.log(emailRegExp.test(this.email))
    if(emailRegExp.test(this.email)){
      this.emailVerificationService.VerifyEmailAddress(this.email.toLowerCase()).subscribe(
        (response) => {
          this.value = response;
          console.log("the result is:" + this.value);
          if (this.value == 1) {
            console.log("Entered email id is a valid one hi");
            this.isError=false;
            this.verificationResponse = "";
            this.disableGetOtp=false;
          }else {
            console.log("Entered email address is not a registred email address hrllo");
            this.isError = true;
            this.verificationResponse = "Enter valid credentials";
            this.disableGetOtp=true;
          }
        },
        (error: any) => {
          this.verificationResponse = "";
          this.isError = false;
        }
      )
    }else{
        if(this.email.length!=0){
        this.isError = true;
        this.verificationResponse = "Enter valid credentials";
        }else{
          this.verificationResponse = "";
        }
    }
  }

  /**
   * 
   */
  disableGetOtp:boolean=false;
  constructOtp() {
    this.disableGetOtp=true;
    console.log(this.email);
    
    var emailRegExp = /^[A-Za-z0-9._]{2,30}[0-9]{0,9}@[A-Za-z]{3,12}[.]{1}[A-Za-z.]{3,6}$/;
    console.log(emailRegExp)
    if(emailRegExp.test(this.email)){
    
    this.isError=false;  
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
  else{
    this.toastr.error("Email ID is incorrect and hence OTP is not sent ")
  }

      
}
  

  /** justify-content: center;
    align-items: center;
    border-radius: 4px;
    background-size: cover;
    object-fit: cover;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5);
   * 
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription.unsubscribe();
  }
}


import { Component, ElementRef, Renderer2 } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ForgotPasswordOtpValidationService } from '../forgot-password-otp-validation/service/forgot-password-otp-validation.service';
import { ForgotPasswordEmailVerificationService } from '../forgot-password-email-verification/service/forgot-password-email-verification.service';
import { ToastrService } from 'ngx-toastr';
import { ForgotPasswordOtpValidationComponent } from '../forgot-password-otp-validation/forgot-password-otp-validation.component';

@Component({
  selector: 'app-twofactor-otp-validation',
  templateUrl: './twofactor-otp-validation.component.html',
  styleUrls: ['./twofactor-otp-validation.component.css']
})
export class TwofactorOtpValidationComponent {

  otpCode: number;
  result: number;
  private destroy$: Subject<void> = new Subject<void>();
  email: string = '';
  isValidOtp: boolean = false;
  OtpResponseMessage:string='';
  verifyButtonDisabled:boolean=false;

  constructor(private router: Router, private elementRef: ElementRef, 
    private renderer: Renderer2,
    private otpValidationService: ForgotPasswordOtpValidationService,
    private emailVerificationService: ForgotPasswordEmailVerificationService,
    private toastr: ToastrService) {

      this.email = this.router.getCurrentNavigation().extras.state['email']
  }


  ngOnInit() {
    console.log('init-Login')
    $(document).ready(function () {
      $('#emailLabel').hide();
      $('#passwordLabel').hide();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //perform placeholder changing on to the border of textbox
  setupOtpInputPlaceholder(): void {
    const emailInput = this.elementRef.nativeElement.querySelector('#otp');

    // On click, set the placeholder to an empty string
    this.renderer.setAttribute(emailInput, 'placeholder', '');
    this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#emailLabel'), 'display', 'block');
    this.renderer.addClass(this.elementRef.nativeElement.querySelector('#emailDiv'), 'group');

    // Add a click event listener to the body
    this.renderer.listen('body', 'click', (event: MouseEvent) => {
      if (!emailInput.contains(event.target)) {
        // Execute when the focus is outside the textbox
        this.renderer.setAttribute(emailInput, 'placeholder', 'Enter OTP');
        console.log('Focus is outside the textbox');
        this.renderer.removeClass(this.elementRef.nativeElement.querySelector('#emailDiv'), 'group');
        this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#emailLabel'), 'display', 'none');
      }
    });
  }

  setOtp(event:any){
    this.otpCode = event.target.value;
    if(this.otpCode.toString() === "" ){
        this.OtpResponseMessage="";
    }
    else if(this.otpCode.toString()<"6"){
        this.verifyButtonDisabled=false;
    }
  }

  resendOtp(){
    this.emailVerificationService.generateOtpForUser(this.email,'TwoFactorAuth').subscribe(
      (response) => {
        this.result = response;
        console.log(this.result)
        if(this.result > 0){
          console.log('otp has been re-sent to your e-mail '+this.result);
          this.toastr.success("OTP has been sent to your email");
          let navigationExtras: NavigationExtras = {
            state: {
              email: this.email
            }
          }
          this.router.navigate(['/verify-twostep'], navigationExtras);
        }
      }
     )
  }
  
  verifyAndValidateOtp() {
    this.isValidOtp = false;
    this.otpValidationService.verifyUserOtp(this.email, this.otpCode)
    .subscribe((response => {
      this.result = response.body;
      if(this.result === 1){
        console.log('valid otp - navigate to reset password page')
        this.isValidOtp = true;
        this.OtpResponseMessage ="valid OTP";
        let navigationExtras: NavigationExtras = {
          state: {
            email: this.email
          }
        }
        this.toastr.success('Login success')
        this.router.navigateByUrl("/home", navigationExtras)
      }else{
        console.log(' invalid otp please enter a valid one or request for resend otp')
        this.OtpResponseMessage ="Invalid OTP";
        this.verifyButtonDisabled=true;
        let navigationExtras: NavigationExtras = {
          state: {
            email: this.email
          }
        }
        this.router.navigateByUrl("/verify-twostep", navigationExtras)
      }
    }))
  }
  otpValidation(event:KeyboardEvent){
    const invalidChars =['+','-','.','e'];
    const inputElement= event.target as HTMLInputElement;
    if(invalidChars.includes(event.key)|| (inputElement.value.length==6 && event.key!='Backspace'
    )){
        event.preventDefault();
        this.verifyButtonDisabled=false;
    }
  }
}

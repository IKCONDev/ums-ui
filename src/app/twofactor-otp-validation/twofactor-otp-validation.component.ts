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
  jwtToken: string = null;

  constructor(private router: Router, private elementRef: ElementRef, 
    private renderer: Renderer2,
    private otpValidationService: ForgotPasswordOtpValidationService,
    private emailVerificationService: ForgotPasswordEmailVerificationService,
    private toastr: ToastrService) {

      this.email = this.router.getCurrentNavigation().extras.state['email']
      this.jwtToken = this.router.getCurrentNavigation().extras.state['jwtToken']
      console.log(this.jwtToken);
      this.startTimer();
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

  time: number = 120; // 120 seconds = 2 minutes
  display: string;
  interval;

  /**
   * Start the countdown timer
   */
  startTimer() {
    this.interval = setInterval(() => {
      if (this.time > 0) {
        this.time--;
        this.display = this.transform(this.time);
      } else {
        clearInterval(this.interval);
      }
    }, 1000);
    this.display = this.transform(this.time);
  }

  /**
   * Transform the seconds into a formatted time string (mm:ss)
   * @param value - Time in seconds
   * @returns Formatted time string (mm:ss)
   */
  transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    const seconds: number = value - minutes * 60;
    const formattedMinutes: string = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedSeconds: string = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return formattedMinutes + ':' + formattedSeconds;
  }

  /**
   * Pause the timer
   */
  pauseTimer() {
    clearInterval(this.interval);
  }

  /**
   * Reset the timer back to 2 minutes (02:00)
   */
  resetTimer() {
    this.pauseTimer();
    this.time = 120;
    this.display = this.transform(this.time);
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
          this.resetTimer();
          this.startTimer();
          let navigationExtras: NavigationExtras = {
            state: {
              email: this.email,
              jwtToken: this.jwtToken
            }
          }
          this.router.navigate(['/verify-twostep'], navigationExtras);
        }
      }
     )
  }
  
  /**
   * 
   */
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
            email: this.email,
            jwtToken: this.jwtToken
          }
        }
        localStorage.setItem('jwtToken',this.jwtToken);
        this.toastr.success('Login Success')
        this.router.navigateByUrl("/home", navigationExtras)
      }else{
        console.log(' invalid otp please enter a valid one or request for resend otp')
        this.OtpResponseMessage ="Invalid OTP";
        this.verifyButtonDisabled=true;
        let navigationExtras: NavigationExtras = {
          state: {
            email: this.email,
            jwtToken: this.jwtToken
          }
        }
        this.router.navigateByUrl("/verify-twostep", navigationExtras)
      }
    }))
  }

  /**
   * 
   * @param event 
   */
  otpValidation(event:KeyboardEvent){
    this.OtpResponseMessage=''
    const invalidChars =['+','-','.','e'];
    const inputElement= event.target as HTMLInputElement;
    if(invalidChars.includes(event.key)|| (inputElement.value.length==6 && event.key!='Backspace')||event.keyCode===40||event.keyCode===38)
    { 
        this.verifyButtonDisabled=false;
        event.preventDefault();
    }
  }
}

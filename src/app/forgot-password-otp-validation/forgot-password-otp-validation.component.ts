import { Component, ElementRef, Renderer2 } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ForgotPasswordOtpValidationService } from './service/forgot-password-otp-validation.service';
import { ForgotPasswordEmailVerificationComponent } from '../forgot-password-email-verification/forgot-password-email-verification.component';
import { ForgotPasswordEmailVerificationService } from '../forgot-password-email-verification/service/forgot-password-email-verification.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password-otp-validation',
  templateUrl: './forgot-password-otp-validation.component.html',
  styleUrls: ['./forgot-password-otp-validation.component.css']
})
export class ForgotPasswordOtpValidationComponent {

  otpCode: number;
  result: number;
  private destroy$: Subject<void> = new Subject<void>();
  email: string = '';
  isValidOtp: boolean = false;
  OtpResponseMessage: string = '';
  verifyButtonDisabled: boolean = false;
  countPageRefresh:number=0;

  /**
   * 
   * @param router 
   * @param elementRef 
   * @param renderer 
   * @param otpValidationService 
   * @param emailVerificationService 
   * @param toastr 
   */
  constructor(private router: Router, private elementRef: ElementRef,
    private renderer: Renderer2,
    private otpValidationService: ForgotPasswordOtpValidationService,
    private emailVerificationService: ForgotPasswordEmailVerificationService,
    private toastr: ToastrService) {

    this.email = this.router.getCurrentNavigation().extras.state['email']

    this.startTimer();

    // setTimeout(() => {
    //   this.resetTimer();
    // }, 120000);
    const isRefreshed = this.router.routerState.toString();
    this.countPageRefresh=0;
    if(isRefreshed){
    this.countPageRefresh = Number(localStorage.getItem("countPageRefresh"));
     this.countPageRefresh+=1;
     localStorage.setItem("countPageRefresh",String(this.countPageRefresh))
     if(this.countPageRefresh>1){
       this.router.navigate(['/verify-email'])
       this.countPageRefresh = 0;
       localStorage.setItem("countPageRefresh",String(this.countPageRefresh))
        sessionStorage.clear();
        localStorage.clear();
        history.pushState(null, null, location.href);
        window.onpopstate = function () {
        history.go(-1);
      };
     }
    }
  }


  /**
   * 
   */
  ngOnInit() {
    $(document).ready(function () {
      $('#emailLabel').hide();
      $('#passwordLabel').hide();
    });
  }

  /**
   * 
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    localStorage.clear();
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


  /**
   * 
   */
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
        this.renderer.removeClass(this.elementRef.nativeElement.querySelector('#emailDiv'), 'group');
        this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#emailLabel'), 'display', 'none');
      }
    });
  }

  /**
   * 
   * @param event 
   */
  setOtp(event: any) {
    this.otpCode = event.target.value;
    if (this.otpCode.toString() === "") {

      this.OtpResponseMessage = "";
    } else if (this.otpCode.toString() < "6") {
      this.verifyButtonDisabled = false;
    }
  }

  /**
   * 
   */
  resendOtp() {
    this.emailVerificationService.generateOtpForUser(this.email, 'ForgotPassword').subscribe(
      (response) => {
        this.result = response;
        if (this.result > 0) {
          this.toastr.success("OTP has been sent to your email and is valid for 2 minutes.");
          this.resetTimer();
          this.startTimer();
          let navigationExtras: NavigationExtras = {
            state: {
              email: this.email
            }
          }
          this.router.navigate(['/verify-otp'], navigationExtras);
        } else {
          this.router.navigateByUrl("/verify-email");
        }
      }
    )
  }

  /**
   * 
   */
  verifyAndValidateOtp() {
    this.isValidOtp = false;
    if(this.otpCode != 0 && this.otpCode != undefined){
      this.otpValidationService.verifyUserOtp(this.email, this.otpCode)
      .subscribe((response => {
        this.result = response.body;
        
        if (this.result === 1) {
          this.isValidOtp = true;
          this.OtpResponseMessage = "Valid OTP";

          let navigationExtras: NavigationExtras = {
            state: {
              email: this.email
            }
          }
          this.router.navigateByUrl("/reset-password", navigationExtras)
        } 
        else {
          this.OtpResponseMessage = "Invalid OTP";
          this.verifyButtonDisabled = true;
          let navigationExtras: NavigationExtras = {
            state: {
              email: this.email
            }
          }
          this.router.navigateByUrl("/verify-otp", navigationExtras)
        }
      }))

    }else{
       this.OtpResponseMessage = "Enter OTP       "
    }
    
  }
  otpValidation(event: KeyboardEvent) {
    const validChars = /^[0-9\b]+$/;
    const inputElement = event.target as HTMLInputElement;
    
    // Clear the error message when the user starts modifying the OTP
    this.OtpResponseMessage = "";
    
    // Allow the backspace key without validation
    if (event.key === "Backspace") {
        return;
    }
    
    // Validate the input using the regular expression
    if (!validChars.test(event.key)) {
        event.preventDefault(); // Prevent the input of invalid characters
        console.log("Invalid character entered");
        // this.verifyButtonDisabled = true; // Disable the verify button when input is invalid
    } else {
        this.verifyButtonDisabled = false; // Enable the verify button when input is valid
    }
}
}

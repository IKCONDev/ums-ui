import { Component, ElementRef, Renderer2 } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ForgotPasswordEmailVerificationService } from './service/forgot-password-email-verification.service';
import { error } from 'jquery';
import { ToastrService } from 'ngx-toastr';

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
        this.renderer.removeClass(this.elementRef.nativeElement.querySelector('#emailDiv'), 'group');
        this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#emailLabel'), 'display', 'none');
      }
    });
  }

  
  /**
   * 
   * @param event 
   */
  setUserEmail(event: any) {
    this.isError = false;
    this.email = event.target.value;
    console.log(this.email);
    this.emailVerificationService.VerifyEmailAddress(this.email).subscribe(
      (response) => {
        this.value = response;
        console.log("the result is:" + this.value);
        if (this.value == 1) {
          console.log("Entered email id is a valid one");
          this.verificationResponse = "";
        }
        else {
          console.log("Entered email address is not a valid email address");
          this.isError = true;
          this.verificationResponse = "Incorrect Email Id";
        }
      },
      (error: any) => {
        this.verificationResponse = "";
        this.isError = true;
      }
    )
  }

  /**
   * 
   */
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

  /**
   * 
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


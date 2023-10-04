import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ForgotPasswordResetService } from './service/forgot-password-reset.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password-reset',
  templateUrl: './forgot-password-reset.component.html',
  styleUrls: ['./forgot-password-reset.component.css']
})
export class ForgotPasswordResetComponent {

  private destroy$: Subject<void> = new Subject<void>();
  newPassword: string ='';
  confirmPassword: string;
  email : string;
  passwordUpdateStatus: number;

  constructor(private router: Router, private elementRef: ElementRef, private renderer: Renderer2,
   private resetPasswordService: ForgotPasswordResetService, private toastr:ToastrService) {
    this.email = this.router.getCurrentNavigation().extras.state['email']
  }

  ngOnInit() {
    console.log(this.router.url);
    console.log('init-Login')
    $(document).ready(function () {
      $('#nPasswordLabel').hide();
      $('#passwordLabel').hide();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateToForgotPassword() {
    this.router.navigateByUrl("/forgot-password");
  }

  setupNewPasswordInputPlaceholder(): void {
    const emailInput = this.elementRef.nativeElement.querySelector('#newPassword');

    // On click, set the placeholder to an empty string
    this.renderer.setAttribute(emailInput, 'placeholder', '');
    this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#nPasswordLabel'), 'display', 'block');
    this.renderer.addClass(this.elementRef.nativeElement.querySelector('#nPasswordDiv'), 'group');

    // Add a click event listener to the body
    this.renderer.listen('body', 'click', (event: MouseEvent) => {
      if (!emailInput.contains(event.target)) {
        // Execute when the focus is outside the textbox
        this.renderer.setAttribute(emailInput, 'placeholder', 'New Password');
        console.log('Focus is outside the textbox');
        this.renderer.removeClass(this.elementRef.nativeElement.querySelector('#nPasswordDiv'), 'group');
        this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#nPasswordLabel'), 'display', 'none');
      }
    });
  }

  setupConfirmPasswordInputPlaceholder(): void {
    const emailInput = this.elementRef.nativeElement.querySelector('#confirmPassword');

    // On click, set the placeholder to an empty string
    this.renderer.setAttribute(emailInput, 'placeholder', '');
    this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#passwordLabel'), 'display', 'block');
    this.renderer.addClass(this.elementRef.nativeElement.querySelector('#passwordDiv'), 'group');

    // Add a click event listener to the body
    this.renderer.listen('body', 'click', (event: MouseEvent) => {
      if (!emailInput.contains(event.target)) {
        // Execute when the focus is outside the textbox
        this.renderer.setAttribute(emailInput, 'placeholder', 'Confirm Password');
        console.log('Focus is outside the textbox');
        this.renderer.removeClass(this.elementRef.nativeElement.querySelector('#passwordDiv'), 'group');
        this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#passwordLabel'), 'display', 'none');
      }
    });
  }
  isUpdate: boolean = true;
  verificationResponse: string ='';
  passwordCriteria : string='';
  result_value: boolean;
  setNewPassword(event : any){
     this.newPassword = event.target.value;
     this.result_value=this.isPasswordvalid(this.newPassword);
     console.log(this.newPassword); 
     if(this.result_value=== true){
       console.log("strong password");
       this.passwordCriteria="Strong Password";

     }
     else{
        console.log("weak password");
        this.passwordCriteria="Weak Password";
     }
     

  }
  setConfirmPassword(event : any){
    this.isUpdate=true;
    this.confirmPassword = event.target.value;
    console.log(this.confirmPassword);
    if(this.newPassword === this.confirmPassword){
       this.isUpdate =false;
       this.verificationResponse="";
    }
    else if(this.newPassword==''&& this.confirmPassword==''){
       this.verificationResponse="";
    }
    else{
      this.verificationResponse="Password doesn't match";
      console.log("password doesn't match");
    }

  }
  isPasswordvalid(newPassword:string) : boolean{
    const minLength =8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const space=/ /.test(newPassword);
    const hasSpecialChar = /[!@#$^&*()_+{}\[\]:;<>,.?~\\/-]/.test(newPassword);
    return (newPassword.length>=minLength && hasUppercase&&hasLowercase&&hasNumber&&hasSpecialChar&&!space);
  }
  updatePassword(){ 
    if(this.passwordCriteria==="Strong Password"){
      this.resetPasswordService.updateUserPassword(this.email, this.newPassword, this.confirmPassword)
      .subscribe(
      (response) => {
        this.passwordUpdateStatus = response.body;
        if(this.passwordUpdateStatus === 1){
          this.toastr.success("Success","ResetPassword");
          this.router.navigateByUrl("/");
         }
      }
      )
    }
    else{
      this.toastr.error("Password Criteria Not Met","ResetPassword");
    }
  }

  /*
  //using jquery
  changePasswordPlaceHolderPosition() {
    $('#passwordLabel').show();
    var confirmPasswordInput = document.getElementById('confirmPassword');

    //on click on the password text box set place holder to empty
    confirmPasswordInput?.setAttribute('placeholder', '');
    document.getElementById('passwordDiv')?.classList.add('group');

    //add event listner for on body click event
    document.body.addEventListener('click', (event) => {
      if (event.target !== confirmPasswordInput) {
        //execute when the focus is outside the text box
        confirmPasswordInput?.setAttribute('placeholder', 'Password');
        document.getElementById('passwordDiv')?.classList.remove('group');
        $('#passwordLabel').hide();

      }
    });
  }
  */

}

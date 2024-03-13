import { Component, ElementRef, Output, Renderer2 } from '@angular/core';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ChangepasswordService } from './service/changepassword.service';
import { ForgotPasswordResetService } from '../forgot-password-reset/service/forgot-password-reset.service';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css']
})
export class ChangepasswordComponent implements OnInit {

  @Output() title : string ="Change Password";

  inputField: HTMLInputElement;
  eyeIcon: HTMLElement;
  oldPassword:string='';
  newPassword: string ='';
  confirmPassword: string;
  email : string;
  passwordUpdateStatus: number;
 // resetPasswordService: any;
  constructor(private router: Router, private elementRef: ElementRef, private renderer: Renderer2,private toastr:ToastrService, private changepassword :ChangepasswordService,
     private resetpasswordservice : ForgotPasswordResetService, private passwordservice : ChangepasswordService){
  }

  ngOnInit(): void {
    this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#newPasswordEye'), 'display','none')
    this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#confirmPasswordEye'), 'display','none')
    this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#oldPasswordEye'), 'display','none')
    $(document).ready(function () {
      $('#oldPasswordLabel').hide();
      $('#nPasswordLabel').hide();
      $('#passwordLabel').hide();
    });
  }

  navigateToForgotPassword() {
    this.router.navigateByUrl("/forgot-password");
  }

  setupOldPasswordInputPlaceholder(): void {
    const emailInput = this.elementRef.nativeElement.querySelector('#oldPassword');

    // On click, set the placeholder to an empty string
    this.renderer.setAttribute(emailInput, 'placeholder', '');
    this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#oldPasswordLabel'), 'display', 'block');
    this.renderer.addClass(this.elementRef.nativeElement.querySelector('#oldPasswordDiv'), 'group');

    // Add a click event listener to the body
    this.renderer.listen('body', 'click', (event: MouseEvent) => {
      if (!emailInput.contains(event.target)) {
        // Execute when the focus is outside the textbox
        this.renderer.setAttribute(emailInput, 'placeholder', 'Old Password');
        //this.renderer.removeClass(this.elementRef.nativeElement.querySelector('#nPasswordDiv'), 'group');
        //this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#nPasswordLabel'), 'display', 'none');
      }
    });
    this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#oldPasswordEye'), 'display','block');
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
        //this.renderer.removeClass(this.elementRef.nativeElement.querySelector('#nPasswordDiv'), 'group');
        //this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#nPasswordLabel'), 'display', 'none');
      }
    });
    this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#newPasswordEye'), 'display','block');
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
        //this.renderer.removeClass(this.elementRef.nativeElement.querySelector('#passwordDiv'), 'group');
        //this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#passwordLabel'), 'display', 'none');
      }
    });
    this.renderer.setStyle(this.elementRef.nativeElement.querySelector('#confirmPasswordEye'), 'display','block');
  }

  isUpdate: boolean = true;
  verificationResponse: string ='';
  passwordCriteria : string='';
  result_value: boolean;
  setNewPassword(event: any) {
    this.newPassword = event.target.value;
  
    if (this.newPassword === '') {
      this.passwordCriteria = '';
      this.verificationResponse = '';
    } else {
      const spaceAtFrontAndLast = /^\s|\s$/.test(this.newPassword);
      if(!spaceAtFrontAndLast===false){
        this.passwordCriteria = "Your password can’t start or end with a blank space";
        this.result_value=false
      }
      else{
      this.result_value = this.isPasswordvalid(this.newPassword);
      if (this.result_value === true) {
        this.passwordCriteria = "Strong Password";
      } else {
        this.passwordCriteria = "Weak Password";
      }
      // Checking the new password and confirm password match or not
      if (this.newPassword === this.confirmPassword && this.passwordCriteria==='Strong Password') {
        this.isUpdate = false;
        this.verificationResponse = "";
      } else if (this.newPassword === '' && this.confirmPassword === '') {
        this.verificationResponse = "";
      } else {
        // Check if both new and confirm passwords are non-empty
        if (this.newPassword !== '' && this.confirmPassword !== '') {
          this.verificationResponse = "Password doesn't match";
          this.isUpdate = true;
        } else {
          this.verificationResponse = "";
        }
      }
    }
  }
}
  
  setConfirmPassword(event: any) {
    this.isUpdate = true;
    this.confirmPassword = event.target.value;
  
    if (this.newPassword === this.confirmPassword) {
      if(this.result_value!=false){
      this.isUpdate = false;
      this.verificationResponse = "";
      }
      else{
        this.verificationResponse = "Weak Password"
      }
    } else if (this.newPassword === '' && this.confirmPassword === '') {
      this.verificationResponse = "";
    } else {
      if (this.newPassword !== '' && this.confirmPassword !== '') {
        this.verificationResponse = "Password doesn't match";
      } else {
        this.verificationResponse = "";
      }
    }
  }
  
  isPasswordvalid(newPassword:string) : boolean{
    const minLength =8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const spaceAtFrontAndLast = /^\s|\s$/.test(newPassword);
    const hasSpecialChar = /[!@#$^&*()_+{}\[\]:;<>,.?~\\/-]/.test(newPassword);
    return (newPassword.length>=minLength && hasUppercase&&hasLowercase&&hasNumber&&hasSpecialChar&&!spaceAtFrontAndLast);
  }
 value : boolean; 
  checkPassword(){
    this.email = localStorage.getItem("email")
    this.changepassword.checkPassword(this.email, this.oldPassword).subscribe({
       next : response =>{
          this.value = response.body
          console.log(" the value is "+ this.value)
          if(this.value===true){
            console.log(" entered method:")
            this.updatePassword();
          }else{
            this.toastr.warning("Old Password is not correct");
          }
       }
    })
  }
  updatePassword(){ 
    if(this.newPassword === this.confirmPassword&&this.passwordCriteria==="Strong Password"){
      this.passwordservice.updateUserPassword(this.email, this.newPassword, this.confirmPassword)
      .subscribe(
      (response) => {
        this.passwordUpdateStatus = response.body;
        if(this.passwordUpdateStatus === 1){
          this.toastr.success("Success","Reset Password");
          this.router.navigateByUrl("/");
         }else if(this.passwordUpdateStatus===0){
          this.toastr.warning("New password must not match previous 3 passwords");
         }
        }
      )
    }
  }

  showOldPasswordEyeIcon(){
    this.inputField = document.getElementById("oldPassword") as HTMLInputElement;
    this.eyeIcon = document.getElementById('oldPasswordEye') as HTMLElement;
    if(this.inputField.type === "password"){
      this.inputField.type = "text";
      this.eyeIcon.classList.add('fa-eye');
      this.eyeIcon.classList.remove('fa-eye-slash')
    }else{
      this.inputField.type = "password";
      this.eyeIcon.classList.remove('fa-eye');
      this.eyeIcon.classList.add('fa-eye-slash')
    }
    
  }

  showNewPasswordEyeIcon(){
    this.inputField = document.getElementById("newPassword") as HTMLInputElement;
    this.eyeIcon = document.getElementById('newPasswordEye') as HTMLElement;
    if(this.inputField.type === "password"){
      this.inputField.type = "text";
      this.eyeIcon.classList.add('fa-eye');
      this.eyeIcon.classList.remove('fa-eye-slash')
    }else{
      this.inputField.type = "password";
      this.eyeIcon.classList.remove('fa-eye');
      this.eyeIcon.classList.add('fa-eye-slash')
    }
  }

  showConfirmPasswordEyeIcon(){
    this.inputField = document.getElementById("confirmPassword") as HTMLInputElement;
    this.eyeIcon = document.getElementById('confirmPasswordEye') as HTMLElement;
    if(this.inputField.type === "password"){
      this.inputField.type = "text";
      this.eyeIcon.classList.add('fa-eye');
      this.eyeIcon.classList.remove('fa-eye-slash')
    }else{
      this.inputField.type = "password";
      this.eyeIcon.classList.remove('fa-eye');
      this.eyeIcon.classList.add('fa-eye-slash')
    }
    
  }
  getPOPUPMessage(){
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
  }

}

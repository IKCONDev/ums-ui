import { Component, Input } from '@angular/core';
import { MyProfileService } from './service/my-profile.service';
import { Users } from '../model/Users.model';
import { data, error, event } from 'jquery';
import { ToastrService } from 'ngx-toastr';
import { elementAt } from 'rxjs';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-profile-panle',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent {

  fileSize: number = 1000000; //1MB
  retriveResponse: any;
  isDisable: boolean = true;
  constructor(private profileService: MyProfileService, private toastr: ToastrService) {

  }

  ngOnInit() {
    this.fetchUserProfile();
  }

  title = 'My Profile'
  user: Users

  selectedUserProfilePic: Blob;

  fetchUserProfile() {
    this.profileService.getUserprofile(localStorage.getItem('email')).subscribe(
      (response) => {
        this.user = response.body;
        console.log(this.user);
      }
    )
  }

  onFileChanged(event: any) {
    this.selectedUserProfilePic = event.target.files[0];
    if (this.selectedUserProfilePic.size < this.fileSize) {
      //execute
      console.log(localStorage.getItem('email'));
      this.profileService.updateUserProfilePic(localStorage.getItem('email'), this.selectedUserProfilePic).subscribe(
        (response) => {
          this.selectedUserProfilePic = response.profilePic;
          this.toastr.success('Profile pic uploaded succesfully');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      )
    } else {
      this.toastr.error('File size ig greater than 1MB')
    }

  }
  editUserInfo() {
    this.isDisable = false;
  }

  updateUserInfo() {
    if (this.user.employee != null) {
      console.log(this.user.employee)
      this.profileService.updateUserInformation(this.user.employee).subscribe({
        next: (response) => {
          if (response.status === HttpStatusCode.Created) {
            this.user.employee.firstName = response.body.firstName;
            this.toastr.success('User details saved sucessfully');
          }
        },error: (error) =>{
          this.toastr.error('Error while updating user details');
        }
      }
        
      ),
      this.isDisable = true;

    }
  }

  cancel() {
    this.isDisable = true;
  }

}


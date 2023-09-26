import { Component, Input } from '@angular/core';
import { MyProfileService } from './service/my-profile.service';
import { Users } from '../model/Users.model';
import { data, error, event } from 'jquery';
import { ToastrService } from 'ngx-toastr';
import { elementAt } from 'rxjs';

@Component({
  selector: 'app-profile-panle',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent {

  fileSize: number = 12000;
  retriveResponse: any;
  isDisable:boolean=true;
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
      console.log("file size grater than 10kb")
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
      this.toastr.error('File size ig greater than 10KB')
    }

  }
  editUserInfo(){
    this.isDisable=false;
  }

  updateUserInfo(){
    if(this.user.employee!=null){
    this.profileService.updateUserInformation(this.user.employee).subscribe(
      (response) =>{
        if (response!=null){
        this.user.employee.firstName =response.firstName;
      }
      else
      console.log("some error")
    }
    )
    this.isDisable=true; 

  }
}
cancel(){
  this.isDisable=true;
}

}


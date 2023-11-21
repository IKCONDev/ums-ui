import { Component, Input } from '@angular/core';
import { MyProfileService } from './service/my-profile.service';
import { Users } from '../model/Users.model';
import { data, error, event } from 'jquery';
import { ToastrService } from 'ngx-toastr';
import { HttpStatusCode } from '@angular/common/http';
import { EmployeeService } from '../employee/service/employee.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-panle',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent {

  fileSize: number = 2000000; //2MB
  retriveResponse: any;
  isDisable: boolean = true;
  title = 'My Profile'
  user: Users
  selectedUserProfilePic: Blob;
  reportingManagerName: string;
  isHovered:boolean=false;

  /**
   * 
   * @param profileService 
   * @param toastr 
   */
  constructor(private profileService: MyProfileService, private toastr: ToastrService,
    private employeeService: EmployeeService, private router: Router) {

  }

  /**
   * 
   */
  ngOnInit() {
    this.fetchUserProfile();
  }

   /**
   * 
   * @param emailId 
   */
   getEmployee(emailId: string){
    this.employeeService.getEmployee(emailId).subscribe({
      next: reponse => {
        this.reportingManagerName = reponse.body.firstName+" "+reponse.body.lastName;
      },error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      }
    })
  }

  /**
   * 
   */
  fetchUserProfile() {
    this.profileService.getUserprofile(localStorage.getItem('email')).subscribe(
      (response) => {
        this.user = response.body;
        console.log(this.user);
        //get reporting manager of employee
        this.getEmployee(this.user.employee.reportingManager);
      }
    )
  }

  /**
   * 
   * @param event 
   */
  onFileChanged(event: any) {
    this.selectedUserProfilePic = event.target.files[0];
    if (this.selectedUserProfilePic.size < this.fileSize) {
      
      //execute
      console.log(localStorage.getItem('email'));
      this.profileService.updateUserProfilePic(localStorage.getItem('email'), this.selectedUserProfilePic).subscribe(
        (response) => {
          if (response.status === HttpStatusCode.Ok) {
            this.selectedUserProfilePic = response.body.profilePic;
            this.toastr.success('Profile pic uploaded succesfully');
            
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else if (response.status === HttpStatusCode.Unauthorized) {
            //TODO: SHOW UNAUTHORIZED PAGE
          }
          else if(response.status===HttpStatusCode.NoContent){
            this.toastr.error('Please select a valid image file')
          }
          
        }
      )
    } else {
      this.toastr.error('File size is greater than 2 MB')
    }

  }

  /**
   * 
   */
  editUserInfo() {
    this.isDisable = false;
  }

  /**
   * 
   */
  updateUserInfo() {
    if (this.user.employee != null) {
      console.log(this.user.employee)
      this.profileService.updateUserInformation(this.user.employee).subscribe({
        next: (response) => {
          if (response.status === HttpStatusCode.Created) {
            this.user.employee.firstName = response.body.firstName;
            this.toastr.success('User details saved sucessfully');
          }
        }, error: (error) => {
          this.toastr.error('Error while updating user details');
        }
      }

      ),
        this.isDisable = true;

    }
  }

  /**
   * 
   */
  cancel() {
    this.isDisable = true;
    this.profileService
  }

  deleteImage(event:Event){
    event.stopPropagation();
    console.log("deleted");
    this.profileService.deleteProfilePic().subscribe({
      next: (response) => {
          this.toastr.success('Profile pic deleted successfully');
          window.location.reload();
      }, error: (error) => {
        this.toastr.error('Error while deleting profile pic');
      }
    })
  }
}


import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Employee } from 'src/app/model/Employee.model';
import { HeaderService } from 'src/app/header/service/header.service';
import { Observable } from 'rxjs';
import { Users } from 'src/app/model/Users.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})

export class MyProfileService{

  gatewayMicroservicepathUrl: string;
  usersMicroservicePathUrl: string;
  employeesMicroservicePathUrl: string;
  userProfilepathUrl: string;
  updateProfilepathUrl: string;
  finalUrl: string;
  finalUrlForDeletingPic: string;
  finalUrlForUpdating: string;
  /**
   * 
   * @param http 
   * @param headerService 
   */
    constructor(private http: HttpClient, private headerService: HeaderService){
      this.gatewayMicroservicepathUrl = environment.apiURL;
      this.usersMicroservicePathUrl = '/users'
      this.employeesMicroservicePathUrl = '/employees'
      this.userProfilepathUrl ='/profile-pic';
      this.updateProfilepathUrl='/update';
      this.finalUrl=this.gatewayMicroservicepathUrl+this.usersMicroservicePathUrl+this.userProfilepathUrl;
      this.finalUrlForDeletingPic=this.gatewayMicroservicepathUrl+this.usersMicroservicePathUrl+"/deleteProfilePic";
      this.finalUrlForUpdating=this.gatewayMicroservicepathUrl+this.employeesMicroservicePathUrl
     +this.updateProfilepathUrl;
    }


    
    /**
     * 
     * @param email 
     * @returns 
     */                    
    getUserprofile(email: string){
        return this.headerService.fetchUserProfile(email);
    }
    
    /**
     * 
     * @param email 
     * @param profilePic 
     * @returns 
     */
    updateUserProfilePic(email: string,profilePic:any){
      /*
      let profilePicObjectDetails = {
        email: email,
        profilePic: profilePic
      }
      */
     //console.log( this.http.patch<Users>(this.finalUrl,email,profilePic));
     const userdata = new FormData();
     userdata.append('email',email);
     userdata.append('profilePic',profilePic)
      return this.http.post<Users>(this.finalUrl,userdata,{observe:'response',headers: new HttpHeaders({
        'Authorization':'Bearer '+localStorage.getItem('jwtToken')
      }
      )})
    }

    /**
     * 
     * @param employee 
     * @returns 
     */
    updateUserInformation(employee:Employee){
      if (employee!=null){
      return this.http.put<Employee>(this.finalUrlForUpdating,employee, {observe:'response',headers: new HttpHeaders({
        'Authorization':'Bearer '+localStorage.getItem('jwtToken')
      }
      )})
      }
      else {
        return null;
    }
  }
  emailId:string=null;
  deleteProfilePic(){
    this.emailId=localStorage.getItem('email')
  return this.http.delete<any>(this.finalUrlForDeletingPic ,{
    params: { email: this.emailId },
    headers: new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
    }),
    observe: 'response'
  }
);
}

}
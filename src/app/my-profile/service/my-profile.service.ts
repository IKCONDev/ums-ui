import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Employee } from 'src/app/model/Employee.model';
import { HeaderService } from 'src/app/header/service/header.service';
import { Observable } from 'rxjs';
import { Users } from 'src/app/model/Users.model';

@Injectable({
  providedIn: 'root',
})

export class MyProfileService{

  /**
   * 
   * @param http 
   * @param headerService 
   */
    constructor(private http: HttpClient, private headerService: HeaderService){
      
    }

     gatewayMicroservicepathUrl = 'http://localhost:8012';
     usersMicroservicePathUrl = '/users'
     employeesMicroservicePathUrl = '/employees'
    userProfilepathUrl ='/profile-pic';
    updateProfilepathUrl='/update';
    finalUrl=this.gatewayMicroservicepathUrl+this.usersMicroservicePathUrl+this.userProfilepathUrl;
    finalUrlForDeletingPic=this.gatewayMicroservicepathUrl+this.usersMicroservicePathUrl+"/deleteProfilePic";
    finalUrlForUpdating=this.gatewayMicroservicepathUrl+this.employeesMicroservicePathUrl
    +this.updateProfilepathUrl;
    
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
      console.log(email);
      console.log(profilePic);
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
        console.log(employee.firstName);
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
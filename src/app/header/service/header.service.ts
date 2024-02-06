import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Employee } from 'src/app/model/Employee.model';
import { Users } from 'src/app/model/Users.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  gatewayUrl: string;
  authenticationMicroservicePathUrl: string;
  finalHttpUrl: string;
  userProfileUrl:string
  twofactorAuthUpdateUrl:string
    /**
     * 
     * @param http 
     */
    constructor(private http: HttpClient){
    this.gatewayUrl = environment.apiURL;
    this.authenticationMicroservicePathUrl = '/users';
    this.finalHttpUrl = this.gatewayUrl+this.authenticationMicroservicePathUrl;
    this.userProfileUrl = '/user-profile'
    this.twofactorAuthUpdateUrl = '/update-auth'
    }
    //username and email both are same, any wording can be used
    //fetches user profile details

    /**
     * 
     * @param username 
     * @returns 
     */
    fetchUserProfile(username: string):any{
      //httpHeaders: HttpHeaders = new HttpHeaders();
        return this.http.get<Users>(`${this.finalHttpUrl}${this.userProfileUrl}/`+username,{observe:'response'});
    }
    

    /**
     * 
     * @param status 
     * @param username 
     * @returns 
     */
    updateTwofactorAuthenticationStatus(status: boolean, username:string){
      return this.http.patch<number>(`${this.finalHttpUrl}${this.twofactorAuthUpdateUrl}/`+username+"/"+status, {observe:'response',headers: new HttpHeaders({
        'Authorization':'Bearer '+localStorage.getItem('jwtToken')
      }
      )})
    }

}
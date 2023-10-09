import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Employee } from 'src/app/model/Employee.model';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {

    gatewayUrl:string = "http://localhost:8012"
    authenticationMicroservicePathUrl:string = '/users';
    finalHttpUrl:string = this.gatewayUrl+this.authenticationMicroservicePathUrl;
    userProfileUrl:string = '/user-profile'
    twofactorAuthUpdateUrl:string = '/update-auth'
    
    /**
     * 
     * @param http 
     */
    constructor(private http: HttpClient){}
    //username and email both are same, any wording can be used
    //fetches user profile details

    /**
     * 
     * @param username 
     * @returns 
     */
    fetchUserProfile(username: string):any{
      //httpHeaders: HttpHeaders = new HttpHeaders();
        return this.http.get<Employee>(`${this.finalHttpUrl}${this.userProfileUrl}/`+username,{observe:'response',headers: new HttpHeaders({
          'Authorization':'Bearer '+localStorage.getItem('jwtToken')
        }
        )})
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
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {

    gatewayUrl:string = "http://localhost:8012"
    authenticationMicroservicePathUrl:string = '/users';
    finalHttpUrl:string = this.gatewayUrl+this.authenticationMicroservicePathUrl;
    userProfileUrl:string = '/user-profile'
    twofactorAuthUpdateUrl:string = '/update-auth'
    
    constructor(private http: HttpClient){}
    //username and email both are same, any wording can be used
    //fetches user profile details
    fetchUserProfile(username: string):any{
        return this.http.get(`${this.finalHttpUrl}${this.userProfileUrl}/`+username,{observe:'response'})
    }

    //update two factor authentication status of user
    updateTwofactorAuthenticationStatus(status: boolean, username:string){
      return this.http.patch<number>(`${this.finalHttpUrl}${this.twofactorAuthUpdateUrl}/`+username+"/"+status, {observe:'response'});
    }

}
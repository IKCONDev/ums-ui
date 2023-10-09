import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  gatewayUrl = "http://localhost:8012"
  authenticationMicroservicePathUrl = '/users';
  finalHttpUrl = this.gatewayUrl+this.authenticationMicroservicePathUrl;

   /**
    * 
    * @param http 
    */
    constructor(private http: HttpClient){}

    /**
     * 
     * @param user 
     * @returns 
     */
    logUserIfValid(user: Object){
        console.log('user-login-service')
        return this.http.post<HttpHeaders>(`${this.finalHttpUrl}/login`,user,{observe: 'response'});
      }

}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  gatewayUrl: string;
  authenticationMicroservicePathUrl: string
  finalHttpUrl: string;

   /**
    * 
    * @param http 
    */
    constructor(private http: HttpClient){
      this.gatewayUrl = environment.apiURL;
      this.authenticationMicroservicePathUrl = '/users';
      this.finalHttpUrl = this.gatewayUrl+this.authenticationMicroservicePathUrl;
      console.log(this.finalHttpUrl)
    }

    /**
     * 
     * @param user 
     * @returns 
     */
    logUserIfValid(user: Object){
         return this.http.post<HttpHeaders>(`${this.finalHttpUrl}/login`,user,{observe: 'response'});
    }

}
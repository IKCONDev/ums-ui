import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root',
  })
  export class TwofactorAuthenticationService {

    private gatewayUrl: string;
    private authenticationMicroservicePathUrl: string;
    private finalHttpUrl: string;
    private generateOtpPathUrl: string;

    constructor(private http: HttpClient){
      this.gatewayUrl = environment.apiURL;
      this.authenticationMicroservicePathUrl = '/users';
      this.finalHttpUrl = this.gatewayUrl+this.authenticationMicroservicePathUrl;
      this.generateOtpPathUrl = 'generate-otp';
    }

    /**
     * 
     * @param email 
     * @param pageType 
     * @returns 
     */
    generateTfOtpForUser(email:string,pageType:string){
        return this.http.post<number>(`${this.finalHttpUrl}/${this.generateOtpPathUrl}/`+email+'/'+pageType,{observe: 'response'});
    }

    
  }
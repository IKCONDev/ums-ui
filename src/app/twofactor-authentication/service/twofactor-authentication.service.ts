import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
  })
  export class TwofactorAuthenticationService {

    private gatewayUrl = 'http://localhost:8012'
    private authenticationMicroservicePathUrl = '/users';
    private finalHttpUrl = this.gatewayUrl+this.authenticationMicroservicePathUrl;
    private generateOtpPathUrl = 'generate-otp';

    constructor(private http: HttpClient){

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
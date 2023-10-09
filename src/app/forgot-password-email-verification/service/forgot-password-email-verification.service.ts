import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ForgotPasswordEmailVerificationService {

  private gatewayUrl = 'http://localhost:8012'
  private authenticationMicroservicePathUrl = '/users';
  private finalHttpUrl = this.gatewayUrl+this.authenticationMicroservicePathUrl;
  private generateOtpPathUrl = 'generate-otp';
  private verifyEmailPathUrl = 'validate-email'; 

  /**
   * 
   * @param http 
   */
  constructor(private http: HttpClient){}

  /**
   * 
   * @param email 
   * @param pageType 
   * @returns 
   */
    generateOtpForUser(email: String,pageType:string){
        return this.http.post<number>(`${this.finalHttpUrl}/${this.generateOtpPathUrl}/`+email+'/'+pageType,{observe: 'response'});
    }

    /**
     * 
     * @param email 
     * @returns 
     */
    VerifyEmailAddress(email: string): Observable<any>{ 
      return this.http.get<number>(`${this.finalHttpUrl}/${this.verifyEmailPathUrl}/`+email); 

   } 

}
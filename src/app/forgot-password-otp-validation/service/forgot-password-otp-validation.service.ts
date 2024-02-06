import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ForgotPasswordOtpValidationService {

  private gatewayUrl: string;
  private authenticationMicroservicePathUrl: string;
  private finalHttpUrl : string;
  private validateOtpPathUrl : string;

  /**
   * 
   * @param http 
   */
  constructor(private http: HttpClient){
    this.gatewayUrl = environment.apiURL;
    this.authenticationMicroservicePathUrl = '/users';
    this.finalHttpUrl = this.gatewayUrl+this.authenticationMicroservicePathUrl;
    this.validateOtpPathUrl = 'validate-otp';
  }

  /**
   * 
   * @param emailId 
   * @param otp 
   * @returns 
   */
    verifyUserOtp(emailId: String, otp:number){
      var verifyOtpDetails = {
        email: emailId,
        otpCode: otp
      }
        return this.http.post<number>(`${this.finalHttpUrl}/${this.validateOtpPathUrl}/`,verifyOtpDetails,{observe:'response',headers: new HttpHeaders({
          'Authorization':'Bearer '+localStorage.getItem('jwtToken')
        }
        )});
      }

}
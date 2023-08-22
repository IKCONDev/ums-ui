import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ForgotPasswordOtpValidationService {

  private gatewayUrl = 'http://localhost:8012'
  private authenticationMicroservicePathUrl = '/users';
  private finalHttpUrl = this.gatewayUrl+this.authenticationMicroservicePathUrl;
  private validateOtpPathUrl = 'validate-otp';

  constructor(private http: HttpClient){}

    verifyUserOtp(emailId: String, otp:number){
      var verifyOtpDetails = {
        email: emailId,
        otpCode: otp
      }
        return this.http.post<number>(`${this.finalHttpUrl}/${this.validateOtpPathUrl}/`,verifyOtpDetails,{observe: 'response'});
      }

}
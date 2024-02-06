import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ForgotPasswordEmailVerificationService {

  gatewayUrl: string;
  authenticationMicroservicePathUrl: string;
  finalHttpUrl: string;
  generateOtpPathUrl: string;
  verifyEmailPathUrl: string;

  /**
   * 
   * @param http 
   */
  constructor(private http: HttpClient) {
    this.gatewayUrl = environment.apiURL;
    this.authenticationMicroservicePathUrl = '/users';
    this.finalHttpUrl = this.gatewayUrl + this.authenticationMicroservicePathUrl;
    this.generateOtpPathUrl = 'generate-otp';
    this.verifyEmailPathUrl = 'validate-email';
  }

  /**
   * 
   * @param email 
   * @param pageType 
   * @returns 
   */
  generateOtpForUser(email: String, pageType: string) {
    return this.http.post<number>(`${this.finalHttpUrl}/${this.generateOtpPathUrl}/` + email + '/' + pageType, { observe: 'response' });
  }

  /**
   * 
   * @param email 
   * @returns 
   */
  VerifyEmailAddress(email: string): Observable<any> {
    return this.http.get<number>(`${this.finalHttpUrl}/${this.verifyEmailPathUrl}/` + email);

  }

}
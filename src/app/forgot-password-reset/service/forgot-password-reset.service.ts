import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ForgotPasswordResetService {

  private gatewayUrl: string;
  private authenticationMicroservicePathUrl: string;
  private finalHttpUrl: string;
  private resetPasswordPathUrl: string;

  /**
   * 
   * @param http 
   */
  constructor(private http: HttpClient){
    this.gatewayUrl = environment.apiURL;
    this.authenticationMicroservicePathUrl = '/users';
    this.finalHttpUrl = this.gatewayUrl+this.authenticationMicroservicePathUrl;
    this.resetPasswordPathUrl = 'reset-password';
  }

  /**
   * 
   * @param emailId 
   * @param newPassword 
   * @param confirmPassword 
   * @returns 
   */
    updateUserPassword(emailId: String, newPassword: string, confirmPassword: string){
      var updatedUserDetails = {
        email: emailId,
        newPassword:newPassword,
        confirmPassword: confirmPassword
      }
        return this.http.post<number>(`${this.finalHttpUrl}/${this.resetPasswordPathUrl}/`,updatedUserDetails,{observe: 'response'});
      }

}
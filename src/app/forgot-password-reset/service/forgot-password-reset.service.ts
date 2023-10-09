import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ForgotPasswordResetService {

  private gatewayUrl = 'http://localhost:8012'
  private authenticationMicroservicePathUrl = '/users';
  private finalHttpUrl = this.gatewayUrl+this.authenticationMicroservicePathUrl;
  private resetPasswordPathUrl = 'reset-password';

  /**
   * 
   * @param http 
   */
  constructor(private http: HttpClient){}

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
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { param } from 'jquery';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChangepasswordService {

  private gatewayUrl: string;
  private authenticationMicroservicePathUrl: string;
  private finalHttpUrl: string;
  private resetPasswordPathUrl: string;
  private checkOldPasswordPathUrl:String;

  /**
   * 
   * @param http 
   */
  constructor(private http: HttpClient){
    this.gatewayUrl = environment.apiURL;
    this.authenticationMicroservicePathUrl = '/users';
    this.finalHttpUrl = this.gatewayUrl+this.authenticationMicroservicePathUrl;
    this.resetPasswordPathUrl = 'reset-password';
    this.checkOldPasswordPathUrl='check-oldpassword';
  }

/** 
  @param emailId
  @param oldpassword
  @returns
*/
  checkPassword(emailId:string, oldPassword:String){
    var checkUserDetails = {
      email:emailId,
      oldPassword:oldPassword
    }
    return this.http.post<boolean>(`${this.finalHttpUrl}/${this.checkOldPasswordPathUrl}/`,checkUserDetails,{observe: 'response'})
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

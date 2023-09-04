import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HomeService {

  gatewayUrl = "http://localhost:8012"
  authenticationMicroservicePathUrl = '/users';
  batchProcessingMicroservicePathUrl = '/teams'
  finalHttpUrl = this.gatewayUrl+this.authenticationMicroservicePathUrl;
  finalHttpUrl1 = this.gatewayUrl+this.batchProcessingMicroservicePathUrl;
  organizedMeetingCountPathUrl = '/events/count'

    constructor(private http: HttpClient){}

    getDemoText(){
        return this.http.get<String>(`${this.finalHttpUrl}/demo`,{headers: new HttpHeaders({
          'Authorization':'Bearer '+localStorage.getItem('jwtToken')
        })});
      }


    getUserorganizedMeetingCount(){
      return this.http.get<number>(`${this.finalHttpUrl1}${this.organizedMeetingCountPathUrl}/`+localStorage.getItem('email'));
    }

}
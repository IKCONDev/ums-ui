import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HomeService {

  gatewayUrl = "http://localhost:8012"
  authenticationMicroservicePathUrl = '/users';
  batchProcessingMicroservicePathUrl = '/teams'
  finalAuthHttpUrl = this.gatewayUrl+this.authenticationMicroservicePathUrl;
  finalBatchHttpUrl = this.gatewayUrl+this.batchProcessingMicroservicePathUrl;
  organizedMeetingCountPathUrl = '/events/count';
  attendedMeetingCountPathUrl = '/events/attended-count';

    constructor(private http: HttpClient){}

    getDemoText(){
        return this.http.get<String>(`${this.finalAuthHttpUrl}/demo`,{headers: new HttpHeaders({
          'Authorization':'Bearer '+localStorage.getItem('jwtToken')
        })});
      }

    getUserAttendedMeetingCount(){
      return this.http.get<number>(`${this.finalBatchHttpUrl}${this.attendedMeetingCountPathUrl}/`+localStorage.getItem('userId'));
    }


    getUserorganizedMeetingCount(){
      return this.http.get<number>(`${this.finalBatchHttpUrl}${this.organizedMeetingCountPathUrl}/`+localStorage.getItem('email'));
    }

}
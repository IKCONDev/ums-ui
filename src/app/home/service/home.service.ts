import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HomeService {

  gatewayUrl = "http://localhost:8012"
  meetingsMicroservicePathUrl = 'meetings';

    constructor(private http: HttpClient){}

    /*
    getDemoText(){
        return this.http.get<String>(`${this.finalAuthHttpUrl}/demo`,{headers: new HttpHeaders({
          'Authorization':'Bearer '+localStorage.getItem('jwtToken')
        })});
      }
      */

    getUserAttendedMeetingCount(){
      return this.http.get<number>(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/organized/count/`+localStorage.getItem('email'));
    }


    getUserorganizedMeetingCount(){
      return this.http.get<number>(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/attended/count/`+localStorage.getItem('email'));
    }

}
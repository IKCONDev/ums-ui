import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Meeting } from 'src/app/model/Meeting.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MeetingReportsService {

    private apiGatewayPathUrl: string;
    private reportMicroservicePathUrl: string;

    constructor(private http: HttpClient){
      this.apiGatewayPathUrl = environment.apiURL;
      this.reportMicroservicePathUrl = 'reports';
    }

    /**
     * 
     */
    findMeetingsByOrganizerReport(organizerEmail: string){
        var params = new HttpParams()
        .set('organizer',organizerEmail)
        return this.http.get<Meeting[]>(`${this.apiGatewayPathUrl}/${this.reportMicroservicePathUrl}/meeting/organizer`,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          ),params:params});
    }

    findMeetingsByDepartmentReport(departmentId: number){
      var params = new HttpParams()
        .set('departmentId',departmentId)
        return this.http.get<Meeting[]>(`${this.apiGatewayPathUrl}/${this.reportMicroservicePathUrl}/meeting/department`,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          ),params:params});
    }

    findMeetingsByAttendeeReport(attendeeEmail: string){
      var params = new HttpParams()
      .set('attendee',attendeeEmail)
      return this.http.get<Meeting[]>(`${this.apiGatewayPathUrl}/${this.reportMicroservicePathUrl}/meeting/attendee`,{observe:'response',headers: new HttpHeaders({
          'Authorization':'Bearer '+localStorage.getItem('jwtToken')
        }
        ),params:params});
  }
   findAllMeetings(){

    return this.http.get<Meeting[]>(`${this.apiGatewayPathUrl}/${this.reportMicroservicePathUrl}/meeting/all`,{observe:'response',headers: new HttpHeaders({
        'Authorization':'Bearer '+localStorage.getItem('jwtToken')
      })});
  }
   getAllDepartmentMeetingsCount(){
    return this.http.get<any[]>(`${this.apiGatewayPathUrl}/${this.reportMicroservicePathUrl}/meeting/count`,{observe:'response',headers: new HttpHeaders({
      'Authorization':'Bearer '+localStorage.getItem('jwtToken')
    })});
   }
}
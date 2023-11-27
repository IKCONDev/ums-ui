import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Meeting } from 'src/app/model/Meeting.model';

@Injectable({
  providedIn: 'root',
})
export class MeetingReportsService {

    private apiGatewayPathUrl = 'http://localhost:8012';
    private reportMicroservicePathUrl = 'reports';

    constructor(private http: HttpClient){}

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
}
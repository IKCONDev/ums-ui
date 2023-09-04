import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting } from 'src/app/model/Meeting.model';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {

  private gatewayUrl = 'http://localhost:8012'
  private batchProcessingMicroservicePathUrl = '/teams';
  private finalHttpUrl = this.gatewayUrl+this.batchProcessingMicroservicePathUrl;
  private userEventsPathUrl = 'events';
  private userAttendedEventsPathUrl = 'attendedevents'

  constructor(private http: HttpClient){}

    getUserEvents(email: string){
        return this.http.get<Meeting[]>(`${this.finalHttpUrl}/${this.userEventsPathUrl}/`+email, {observe: 'response'});
    }

    getUserAttendedEvents(email: string){
      return this.http.get<Meeting[]>(`${this.finalHttpUrl}/${this.userAttendedEventsPathUrl}/`+email, {observe: 'response'});
    }

}
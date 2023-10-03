import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting } from 'src/app/model/Meeting.model';
import { Attendee } from 'src/app/model/Attendee.model';
import { ActionItems } from 'src/app/model/actionitem.model';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {

  private gatewayUrl = 'http://localhost:8012'
  
  //to be removed
  private batchProcessingMicroservicePathUrl = '/teams';
  private finalHttpUrl = this.gatewayUrl+this.batchProcessingMicroservicePathUrl;

  private actionsMicroservicePathUrl = 'actions';
  private meetingsMicroservicePathUrl = 'meetings';
  private nlpMicroservicepathUrl = 'nlp'

  //to be removed
  private actionItemsOfEventPathUrl = 'events/actionitems/';
 


  constructor(private http: HttpClient){}

    getUserOraganizedMeetingsByUserId(emailId: string){
      return this.http.get<Meeting[]>(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/organized/`+emailId, {observe: 'response'});
    }

    getUserAttendedMeetingsByUserId(emailId: string){
      return this.http.get<Meeting[]>(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/attended/`+emailId, {observe: 'response'});
    }

    /*
    getActionItemsOfMeeting(meetingId: number){
      return this.http.get<ActionItems[]>(`${this.finalHttpUrl}/${this.actionItemsOfEventPathUrl}/`+meetingId, {observe: 'response'});
    }
    */

    convertActionitemsToTasks(actionItems: ActionItems[]){
      return this.http.post(`${this.gatewayUrl}/${this.actionsMicroservicePathUrl}/convert-task`,actionItems,{observe:'response'});
    }

    getActionItems(){
      return this.http.get<ActionItems[]>(`${this.gatewayUrl}/${this.actionsMicroservicePathUrl}/all`, {observe: 'response'});
    }

    deleteActionItemsOfMeeting(actionItemIds: any[], meetingId: number){
      return this.http.get(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/delete/ac-items/`+meetingId+'/'+actionItemIds,{observe: 'response'})
    }

    generateActionItemsByNlp(userEmail: string){
      return this.http.get(`${this.gatewayUrl}/${this.nlpMicroservicepathUrl}/generate/`+userEmail,{observe:'response'})
    }

}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting } from 'src/app/model/Meeting.model';
import { Attendee } from 'src/app/model/Attendee.model';
import { ActionItems } from 'src/app/model/actionitem.model';
import { Users } from 'src/app/model/Users.model';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {

  private gatewayUrl = 'http://localhost:8012'
  
  //to be removed
  private batchProcessingMicroservicePathUrl = '/teams';
  private finalHttpUrl = this.gatewayUrl+this.batchProcessingMicroservicePathUrl;

  private actionsMicroservicePathUrl = 'actions';
  private tasksMicroservicePathUrl = 'task'
  private meetingsMicroservicePathUrl = 'meetings';
  private nlpMicroservicepathUrl = 'nlp';

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

    convertActionitemsToTasks(actionItems: ActionItems[], meeting: Meeting){
      var meetingActionItems = {
        meeting: meeting,
        actionItems: actionItems
      }
      console.log(this.gatewayUrl+"/"+this.tasksMicroservicePathUrl+"/convert-task"+"/"+meeting.meetingId);
      return this.http.post(`${this.gatewayUrl}/${this.tasksMicroservicePathUrl}/convert-task/${meeting.meetingId}`,actionItems,{observe:'response'});
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

    getActiveUserEmailIdList(){
      return this.http.get<string[]>('http://localhost:8012/users/getEmail-list',{observe:'response'});
    }

}
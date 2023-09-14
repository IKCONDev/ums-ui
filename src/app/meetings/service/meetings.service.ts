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
  private batchProcessingMicroservicePathUrl = '/teams';
  private finalHttpUrl = this.gatewayUrl+this.batchProcessingMicroservicePathUrl;
  private userEventsPathUrl = 'events/organized';
  private userAttendedEventsPathUrl = 'events/attended';
  private actionItemsOfEventPathUrl = 'events/actionitems/';
  private actionItemsPathUrl = 'events/actionitems';

  private eventsMicroservicePathUrl = '/meetings'
  private finalHttpEventsPathUrl = this.gatewayUrl+this.eventsMicroservicePathUrl;
  private deleteActionItemsOfEventPathUrl = 'delete/ac-items';

  private actionItemsMicroservicePathUrl = '/api/actions'
  private finalActionHttpUrl = this.gatewayUrl+this.actionItemsMicroservicePathUrl;
  private convertActionToTaskPathUrl = '/convert-task';

  constructor(private http: HttpClient){}

    getUserEvents(email: string){
        return this.http.get<Meeting[]>(`${this.finalHttpUrl}/${this.userEventsPathUrl}/`+email, {observe: 'response'});
    }

    getUserAttendedEvents(email: string){
      return this.http.get<Meeting[]>(`${this.finalHttpUrl}/${this.userAttendedEventsPathUrl}/`+email, {observe: 'response'});
    }

    getActionItemsOfEvent(eventId: number){
      return this.http.get<ActionItems[]>(`${this.finalHttpUrl}/${this.actionItemsOfEventPathUrl}/`+eventId, {observe: 'response'});
    }

    getActionItems(){
      return this.http.get<ActionItems[]>(`${this.finalHttpUrl}/${this.actionItemsPathUrl}`, {observe: 'response'});
    }

    deleteActionItemsOfEvent(actionItemIds: any[], eventId: number){
      // let deleteActionItemsOfEvent = {
      //   actionItemids:[] = actionItemIds,
      //   eventId: eventId
      // }
      return this.http.get(`${this.finalHttpEventsPathUrl}/${this.deleteActionItemsOfEventPathUrl}/`+eventId+'/'+actionItemIds,{observe: 'response'})
    }

    convertActionitemsToTasks(actionItems: ActionItems[]){
      return this.http.post(`${this.finalActionHttpUrl}${this.convertActionToTaskPathUrl}`,actionItems,{observe:'response'});
    }

}
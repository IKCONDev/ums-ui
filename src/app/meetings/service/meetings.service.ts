import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting } from 'src/app/model/Meeting.model';
import { Attendee } from 'src/app/model/Attendee.model';
import { ActionItems } from 'src/app/model/Actionitem.model';
import { Users } from 'src/app/model/Users.model';
import { MOMObject } from 'src/app/model/momObject.model';

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
 
  /**
   * 
   * @param http 
   */
  constructor(private http: HttpClient){}

    /**
     * 
     * @param emailId,
     * @returns 
     */
    getUserOraganizedMeetingsByUserId(emailId: string){
      return this.http.get<Meeting[]>(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/organized/`+emailId, {observe:'response',headers: new HttpHeaders({
        'Authorization':'Bearer '+localStorage.getItem('jwtToken')
      }
      )});
    }

    /**
     * 
     * @param emailId 
     * @returns 
     */
    getUserAttendedMeetingsByUserId(emailId: string){
      return this.http.get<Meeting[]>(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/attended/`+emailId, {observe:'response',headers: new HttpHeaders({
        'Authorization':'Bearer '+localStorage.getItem('jwtToken')
      }
      )})
    }

    /*
    getActionItemsOfMeeting(meetingId: number){
      return this.http.get<ActionItems[]>(`${this.finalHttpUrl}/${this.actionItemsOfEventPathUrl}/`+meetingId, {observe: 'response'});
    }
    */

    /**
     * 
     * @param actionItems 
     * @param meeting 
     * @returns 
     */
    submitActionItems(actionItems: ActionItems[], meeting: Meeting){
      var meetingActionItems = {
        meeting: meeting,
        actionItems: actionItems
      }
      console.log(this.gatewayUrl+"/"+this.tasksMicroservicePathUrl+"/convert-task"+"/"+meeting.meetingId);
      return this.http.post(`${this.gatewayUrl}/${this.actionsMicroservicePathUrl}/convert-task/${meeting.meetingId}`,actionItems,{observe:'response',headers: new HttpHeaders({
        'Authorization':'Bearer '+localStorage.getItem('jwtToken')
      }
      )})
    }

    /**
     * 
     * @returns 
     */
    getActionItems(){
      return this.http.get<ActionItems[]>(`${this.gatewayUrl}/${this.actionsMicroservicePathUrl}/all`, {observe:'response',headers: new HttpHeaders({
        'Authorization':'Bearer '+localStorage.getItem('jwtToken')
      }
      )})
    }

    /**
     * 
     * @param actionItemIds 
     * @param meetingId 
     * @returns 
     */
    deleteActionItemsOfMeeting(actionItemIds: any[], meetingId: number){
      return this.http.get(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/delete/ac-items/`+meetingId+'/'+actionItemIds,{observe:'response',headers: new HttpHeaders({
        'Authorization':'Bearer '+localStorage.getItem('jwtToken')
      }
      )})
    }

    /**
     * 
     * @param userEmail 
     * @returns 
     */
    generateActionItemsByNlp(userEmail: string){
      return this.http.get(`${this.gatewayUrl}/${this.nlpMicroservicepathUrl}/generate/`+userEmail,{observe:'response',headers: new HttpHeaders({
        'Authorization':'Bearer '+localStorage.getItem('jwtToken')
      }
      )})
    }

    /**
     * 
     * @returns 
     */
    getActiveUserEmailIdList(){
      return this.http.get<string[]>('http://localhost:8012/users/getEmail-list',{observe:'response',headers: new HttpHeaders({
        'Authorization':'Bearer '+localStorage.getItem('jwtToken')
      }
      )})
    }
    

    /**
     * 
     * @param meetingId 
     * @returns 
     */
    getMeetingObject(meetingId : number)
    {
       return this.http.get<Meeting>(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/${meetingId}`,{observe:'response',headers: new HttpHeaders({
        'Authorization':'Bearer '+localStorage.getItem('jwtToken')})
       })
    }

    /**
     * 
     * @param meeting 
     * @returns 
     */
    createMeeting(meeting: any){
      return this.http.post<Meeting>(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/create`,meeting,{observe: 'response',headers: new HttpHeaders({
        'Authorization':'Bearer '+localStorage.getItem('jwtToken')})
       })
    }
    
    sendMinutesofMeeting(emailList: String[],meeting: Meeting){
      console.log("the email List is"+emailList);
      var momObject ={
        meeting: meeting,
        emailList: emailList
        
      }
      return this.http.post<any>(`${this.gatewayUrl}/${this.actionsMicroservicePathUrl}/send-momdata/`,momObject,{observe: 'response',headers: new HttpHeaders({
        'Authorization':'Bearer '+localStorage.getItem('jwtToken')})
       })
    }

}

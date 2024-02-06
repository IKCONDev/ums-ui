import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting } from 'src/app/model/Meeting.model';
import { Attendee } from 'src/app/model/Attendee.model';
import { ActionItems } from 'src/app/model/Actionitem.model';
import { Users } from 'src/app/model/Users.model';
import { MOMObject } from 'src/app/model/momObject.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {

  private gatewayUrl: string;

  //to be removed
  private batchProcessingMicroservicePathUrl: string;
  private finalHttpUrl: string;

  private actionsMicroservicePathUrl: string;
  private tasksMicroservicePathUrl: string;
  private meetingsMicroservicePathUrl: string;
  private nlpMicroservicepathUrl: string;

  //to be removed
  private actionItemsOfEventPathUrl: string;

  /**
   * 
   * @param http 
   */
  constructor(private http: HttpClient) {
    this.gatewayUrl = environment.apiURL;

    //to be removed
    this.batchProcessingMicroservicePathUrl = '/teams';
    this.finalHttpUrl = this.gatewayUrl + this.batchProcessingMicroservicePathUrl;

    this.actionsMicroservicePathUrl = 'actions';
    this.tasksMicroservicePathUrl = 'task'
    this.meetingsMicroservicePathUrl = 'meetings';
    this.nlpMicroservicepathUrl = 'nlp';

    //to be removed
    this.actionItemsOfEventPathUrl = 'events/actionitems/';
  }

  /**
   * 
   * @param emailId,
   * @returns 
   */
  getUserOraganizedMeetingsByUserId(emailId: string, meetingTitleFilter: string, meetingStartDateFilter: string, meetingEndDateFilter: string) {
    if (meetingTitleFilter === '' && meetingStartDateFilter === '' && meetingEndDateFilter === '') {
      return this.http.get<Meeting[]>(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/organized/` + emailId, {
        observe: 'response', headers: new HttpHeaders({
          'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
        }
        )
      });
    } else {
      var params = new HttpParams()
        .set('meetingTitle', meetingTitleFilter)
        .set('startDate', meetingStartDateFilter)
        .set('endDate', meetingEndDateFilter);
      return this.http.get<Meeting[]>(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/organized/` + emailId, {
        observe: 'response', headers: new HttpHeaders({
          'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
        }
        ), params: params
      });
    }
  }

  /**
   * 
   * @param emailId 
   * @returns 
   */
  getUserAttendedMeetingsByUserId(emailId: string, meetingTitle: string, meetingStartDateTime: string, meetingEndDateTime: string) {
    if (meetingTitle === '' && meetingStartDateTime === '' && meetingEndDateTime === '') {
      return this.http.get<Meeting[]>(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/attended/` + emailId, {
        observe: 'response', headers: new HttpHeaders({
          'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
        }
        )
      })
    } else {
      var params = new HttpParams()
        .set('meetingTitle', meetingTitle)
        .set('startDateTime', meetingStartDateTime)
        .set('endDateTime', meetingEndDateTime);
    }
    return this.http.get<Meeting[]>(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/attended/` + emailId, {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      ), params: params
    })
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
  submitActionItems(actionItems: ActionItems[], meeting: Meeting) {
    var meetingActionItems = {
      meeting: meeting,
      actionItems: actionItems
    }
    return this.http.post(`${this.gatewayUrl}/${this.actionsMicroservicePathUrl}/convert-task/${meeting.meetingId}`, actionItems, {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  /**
   * 
   * @returns 
   */
  getActionItems() {
    return this.http.get<ActionItems[]>(`${this.gatewayUrl}/${this.actionsMicroservicePathUrl}/all`, {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  /**
   * 
   * @param actionItemIds 
   * @param meetingId 
   * @returns 
   */
  deleteActionItemsOfMeeting(actionItemIds: any[], meetingId: number) {
    return this.http.get(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/delete/ac-items/` + meetingId + '/' + actionItemIds, {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  /**
   * 
   * @param userEmail 
   * @returns 
   */
  generateActionItemsByNlp(userEmail: string) {
    return this.http.get(`${this.gatewayUrl}/${this.nlpMicroservicepathUrl}/generate/` + userEmail, {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  /**
   * 
   * @returns 
   */
  getActiveUserEmailIdList() {
    return this.http.get<string[]>(this.gatewayUrl+'/users/getEmail-list', {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }


  /**
   * 
   * @param meetingId 
   * @returns 
   */
  getMeetingObject(meetingId: number) {
    return this.http.get<Meeting>(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/${meetingId}`, {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      })
    })
  }

  /**
   * 
   * @param meeting 
   * @returns 
   */
  createMeeting(meeting: any) {
    return this.http.post<Meeting>(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/create`, meeting, {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      })
    })
  }

  sendMinutesofMeeting(emailList: String[], meeting: Meeting, discussionPoints: string, hoursDiff: string, minutesDiff: string) {
    var momObject = {
      meeting: meeting,
      emailList: emailList,
      discussionPoints: discussionPoints,
      hoursDiff: hoursDiff,
      minutesDiff: minutesDiff

    }
    return this.http.post<any>(`${this.gatewayUrl}/${this.actionsMicroservicePathUrl}/send-momdata/`, momObject, {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      })
    })
  }

}

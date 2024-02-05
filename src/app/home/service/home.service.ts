import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { TaskStatusModel } from 'src/app/model/taskStatus.model';

@Injectable({
  providedIn: 'root',
})
export class HomeService {

  gatewayUrl = "http://localhost:8012"
  meetingsMicroservicePathUrl = 'meetings';
  actionItemsMicroservicePathUrl = 'actions';
  tasksMicroservicePathUrl = 'task'

  constructor(private http: HttpClient) { 
  
  }

  /*
  getDemoText(){
      return this.http.get<String>(`${this.finalAuthHttpUrl}/demo`,{headers: new HttpHeaders({
        'Authorization':'Bearer '+localStorage.getItem('jwtToken')
      })});
    }
    */

    /**
     * 
     * @returns 
     */
  getUserAttendedMeetingCount() {
    return this.http.get<number>(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/attended/count/` + localStorage.getItem('email'), {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    });
  }

  /**
   * 
   * @returns 
   */
  getUserorganizedMeetingCount() {
    return this.http.get<number>(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/organized/count/` + localStorage.getItem('email'), {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    });
  }

  /**
   * 
   * @returns 
   */
  getActionItemsCountByUserId(){
    return this.http.get<number>(`${this.gatewayUrl}/${this.actionItemsMicroservicePathUrl}/organized/count/`+localStorage.getItem('email'), {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    });
  }

   /**
   * 
   * @returns 
   */
   getOrganizedTasksCountByUserId(){
    return this.http.get<number>(`${this.gatewayUrl}/${this.tasksMicroservicePathUrl}/organized/count/`+localStorage.getItem('email'), {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    });
  }


   /**
   * 
   * @returns 
   */
   getAssignedTasksCountByUserId(){
    return this.http.get<number>(`${this.gatewayUrl}/${this.tasksMicroservicePathUrl}/assigned/count/`+localStorage.getItem('email'), {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    });
  }

  fetchStatusforWeek(startdate:string,endDate:string){
    const emailId= localStorage.getItem('email')
    return this.http.get<Object[]>(`${this.gatewayUrl}/${this.tasksMicroservicePathUrl}/weekTaskCount`, {
      observe: 'response',params:{startdate:startdate,endDate:endDate,emailId:emailId} ,headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    });
  }

  fetchMeetingStatusforWeek(startdate:string,endDate:string){
   const emailId= localStorage.getItem('email')
    return this.http.get<number[]>(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/MeetingsChartData`, {
      observe: 'response',params:{startdate:startdate,endDate:endDate,emailId:emailId} ,headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    });
  }

  fetchMeetingStatusForYear(startdate:string,endDate:string){
    const emailId= localStorage.getItem('email')
     return this.http.get<number[]>(`${this.gatewayUrl}/${this.meetingsMicroservicePathUrl}/MeetingsChartDataForYear`, {
       observe: 'response',params:{startdate:startdate,endDate:endDate,emailId:emailId} ,headers: new HttpHeaders({
         'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
       }
       )
     });
    }

    fetchTaskStatusForYear(startdate:string,endDate:string){
      const emailId= localStorage.getItem('email')
       return this.http.get<number[]>(`${this.gatewayUrl}/${this.tasksMicroservicePathUrl}/TaskCountForYear`, {
         observe: 'response',params:{startdate:startdate,endDate:endDate,emailId:emailId} ,headers: new HttpHeaders({
           'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
         }
         )
       });
      }

    



}
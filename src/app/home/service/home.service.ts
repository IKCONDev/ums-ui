import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HomeService {

  gatewayUrl = "http://localhost:8012"
  meetingsMicroservicePathUrl = 'meetings';
  actionItemsMicroservicePathUrl = 'actions';
  tasksMicroservicePathUrl = 'tasks'

  constructor(private http: HttpClient) { }

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



}
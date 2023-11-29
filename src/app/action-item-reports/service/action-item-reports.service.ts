import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Meeting } from 'src/app/model/Meeting.model';
import { ActionItems } from 'src/app/model/Actionitem.model';

@Injectable({
  providedIn: 'root',
})
export class ActionItemsReportsService {

    private apiGatewayPathUrl = 'http://localhost:8012';
    private actionItemReportsControllerPathUrl = 'actionReports';

    constructor(private http: HttpClient){}

    findOrganizedActionItemsReportByUserId(organizerEmail: string){
        var params = new HttpParams()
        .set('organizer',organizerEmail)
        return this.http.get<ActionItems[]>(`${this.apiGatewayPathUrl}/${this.actionItemReportsControllerPathUrl}/organizer`,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          ),params:params});
    }

    findActionItemsReportByDepartment(departmentId: number){
        var params = new HttpParams()
        .set('departmentId',departmentId)
        return this.http.get<ActionItems[]>(`${this.apiGatewayPathUrl}/${this.actionItemReportsControllerPathUrl}/department`,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          ),params:params});
    }

    findActionItemsReportByPriority(priority: string){
        var params = new HttpParams()
        .set('priority',priority)
        return this.http.get<ActionItems[]>(`${this.apiGatewayPathUrl}/${this.actionItemReportsControllerPathUrl}/priority`,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          ),params:params});
    }
    getAllDepartmentActionItemsCount(){
      return this.http.get<any[]>(`${this.apiGatewayPathUrl}/${this.actionItemReportsControllerPathUrl}/department-actions`,{observe:'response',headers: new HttpHeaders({
        'Authorization':'Bearer '+localStorage.getItem('jwtToken')
      })});
    }
}
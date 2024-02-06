import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from "@angular/common/http";
import { BatchDetails } from "src/app/model/BatchDetails.model";
import { Task } from "src/app/model/Task.model";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})

export class TaskReportService {

    private gateWayURL: string;
    private teamsbatchProcessMicroserviceURL: string;
    private getAllBatchDetailsURL: string;

    //private reportMicroservicePathUrl = "reports";
    private reportMicroservicePathUrl: string;

    constructor(private http: HttpClient) {
        this.gateWayURL = environment.apiURL;
        this.teamsbatchProcessMicroserviceURL = "teams";
        this.getAllBatchDetailsURL = "batch-details";

        //private reportMicroservicePathUrl = "reports";
        this.reportMicroservicePathUrl = "taskReports";
    }

    /**
     * 
     * @returns 
     */
    getAllBatchProcessDetails() {
        return this.http.get<BatchDetails[]>(`${this.gateWayURL}/${this.teamsbatchProcessMicroserviceURL}/${this.getAllBatchDetailsURL}`, { observe: 'response' })
    }

    findAllTasks(startdate: string, endDate: string) {
        return this.http.get<number[]>(`${this.gateWayURL}/${this.reportMicroservicePathUrl}/tasks/all`, { observe: 'response', params: { startdate: startdate, endDate: endDate } });
    }

    findAllTasksByDepartment(departmentId: number) {
        //prepare request parameters
        let params = new HttpParams()
            .set('departmentId', departmentId);
        return this.http.get<Task[]>(`${this.gateWayURL}/${this.reportMicroservicePathUrl}/tasks/dept`, { observe: 'response', params: params });
    }

    findAllTasksByTaskOwner(taskOwner: string) {
        //prepare request parameters
        let params = new HttpParams()
            .set('taskOwner', taskOwner);
        return this.http.get<Task[]>(`${this.gateWayURL}/${this.reportMicroservicePathUrl}/tasks/owner`, { observe: 'response', params: params });
    }

    findAllTasksByTaskSeverity(severity: string) {
        //prepare request parameters
        let params = new HttpParams()
            .set('serverityLevel', severity);
        return this.http.get<Task[]>(`${this.gateWayURL}/${this.reportMicroservicePathUrl}/tasks/severity`, { observe: 'response', params: params });
    }

    findAllTasksByTaskStatus(taskStatus: string) {
        //prepare request parameters
        let params = new HttpParams()
            .set('taskStatus', taskStatus);
        return this.http.get<Task[]>(`${this.gateWayURL}/${this.reportMicroservicePathUrl}/tasks/status`, { observe: 'response', params: params });
    }

    findAllAgedTasks(currentDateTime: string) {
        // //prepare request parameters
        let params = new HttpParams()
            .set('date', currentDateTime);
        return this.http.get<Task[]>(`${this.gateWayURL}/${this.reportMicroservicePathUrl}/tasks/aged`, { observe: 'response', params: params });
    }
    getAllDepartmentTasksCount() {
        return this.http.get<any[]>(`${this.gateWayURL}/${this.reportMicroservicePathUrl}/task/department-task`, {
            observe: 'response', headers: new HttpHeaders({
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            })
        });
    }

}
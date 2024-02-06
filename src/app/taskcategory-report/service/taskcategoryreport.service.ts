import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Task } from "src/app/model/Task.model";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn :'root'
})
export class TaskCategoryReport{

    private gateWayURL: string;
    //private reportMicroservicePathUrl = "reports";
    private reportMicroservicePathUrl: string;

    constructor( private http: HttpClient){
        this.gateWayURL = environment.apiURL;
        //private reportMicroservicePathUrl = "reports";
        this.reportMicroservicePathUrl = "taskCategoryReports";
    }

    getAllTasksByTaskCategoryId(taskCategoryId : number){
     let params = new HttpParams()
     .set('taskCategoryId',taskCategoryId);
     return this.http.get<Task[]>(`${this.gateWayURL}/${this.reportMicroservicePathUrl}/task/category`,{observe:'response',params:params});

    }
    getAllTasksByCategoryCount(){
        return this.http.get<any[]>(`${this.gateWayURL}/${this.reportMicroservicePathUrl}/task/all-categorycount`,{observe:'response'});
    }

}
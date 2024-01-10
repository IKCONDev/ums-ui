import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Task } from "src/app/model/Task.model";

@Injectable({
    providedIn :'root'
})
export class TaskCategoryReport{

    constructor( private http: HttpClient){}
    private gateWayURL="http://localhost:8012";
    //private reportMicroservicePathUrl = "reports";
    private reportMicroservicePathUrl = "taskCategoryReports";

    getAllTasksByTaskCategoryId(taskCategoryId : number){
     let params = new HttpParams()
     .set('taskCategoryId',taskCategoryId);
     return this.http.get<Task[]>(`${this.gateWayURL}/${this.reportMicroservicePathUrl}/task/category`,{observe:'response',params:params});

    }
    getAllTasksByCategoryCount(){
        return this.http.get<any[]>(`${this.gateWayURL}/${this.reportMicroservicePathUrl}/task/all-categorycount`,{observe:'response'});
    }

}
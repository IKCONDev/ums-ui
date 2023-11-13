import { Injectable } from "@angular/core";
import { HttpClient , HttpHeaders,HttpParams,HttpResponse} from "@angular/common/http";
import { BatchDetails } from "src/app/model/BatchDetails.model";
import { Task } from "src/app/model/Task.model";

@Injectable({
    providedIn : 'root'
})

export class ReportService{

     constructor (private http:HttpClient){}
     private gateWayURL="http://localhost:8012";
     private teamsbatchProcessMicroserviceURL="teams";
     private getAllBatchDetailsURL="batch-details";

     private reportMicroservicePathUrl = "reports";

     /**
      * 
      * @returns 
      */
     getAllBatchProcessDetails(){
         return this.http.get<BatchDetails[]>(`${this.gateWayURL}/${this.teamsbatchProcessMicroserviceURL}/${this.getAllBatchDetailsURL}`,{observe:'response'})   
     }

     findAllTasks(){
        return this.http.get<Task[]>(`${this.gateWayURL}/${this.reportMicroservicePathUrl}/tasks/all`,{observe:'response'});
     }

     findAllTasksByDepartment(departmentId: number){
        //prepare request parameters
        let params = new HttpParams()
        .set('departmentId', departmentId);
        return this.http.get<Task[]>(`${this.gateWayURL}/${this.reportMicroservicePathUrl}/tasks/dept`,{observe:'response',params:params});
     }

     
}
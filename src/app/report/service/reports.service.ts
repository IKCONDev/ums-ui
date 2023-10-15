import { Injectable } from "@angular/core";
import { HttpClient , HttpHeaders,HttpResponse} from "@angular/common/http";
import { BatchDetails } from "src/app/model/BatchDetails.model";

@Injectable({
    providedIn : 'root'
})

export class ReportService{

     constructor (private http:HttpClient){}
     private gateWayURL="http://localhost:8012";
     private teamsbatchProcessMicroserviceURL="teams";
     private getAllBatchDetailsURL="batch-details";

     /**
      * 
      * @returns 
      */
     getAllBatchProcessDetails(){
         return this.http.get<BatchDetails[]>(`${this.gateWayURL}/${this.teamsbatchProcessMicroserviceURL}/${this.getAllBatchDetailsURL}`,{observe:'response'})   
     }
}
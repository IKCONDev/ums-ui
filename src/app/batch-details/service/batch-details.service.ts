import { Injectable } from "@angular/core";
import { HttpClient , HttpHeaders,HttpResponse} from "@angular/common/http";
import { BatchDetails } from "src/app/model/BatchDetails.model";
import { CronDetails } from "src/app/model/CronDetails.model";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn : 'root'
})

export class BatchDetailsService{

    private gateWayURL: string;
     private teamsbatchProcessMicroserviceURL: string;
     private getAllBatchDetailsURL: string;

     constructor (private http:HttpClient){
       this.gateWayURL = environment.apiURL;
       this.teamsbatchProcessMicroserviceURL="teams";
       this.getAllBatchDetailsURL="batch-details";
     }
    

     /**
      * 
      * @returns 
      */
     getAllBatchProcessDetails(){
         return this.http.get<BatchDetails[]>(`${this.gateWayURL}/${this.teamsbatchProcessMicroserviceURL}/${this.getAllBatchDetailsURL}`,{observe:'response'})   
     }

     /**
      * 
      * @param batchProcessTime 
      * @returns 
      */
     updateBatchProcessTime(cronDetailsObj: CronDetails){
        return this.http.put<CronDetails>(`${this.gateWayURL}/${this.teamsbatchProcessMicroserviceURL}/crontime`,cronDetailsObj,{observe: 'response'});
     }

     /**
      * 
      */
     getBatchProcessTimeDetails(){
        return this.http.get<CronDetails>(`${this.gateWayURL}/${this.teamsbatchProcessMicroserviceURL}/crontime`,{observe: 'response'});
     }
}
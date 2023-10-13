import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Department } from "src/app/model/Department.model";
import { Designation } from "src/app/model/designation.model";

@Injectable({
    providedIn : 'root'
})

export class DesignationService{

    gatewayMicroservicePathUrl: string = 'http://localhost:8012';
    designationMicroservicepathUrl: string = 'designations';

    /**
     * 
     * @param http 
     */
    constructor(private http: HttpClient){
        
    }

    /**
     * 
     * @returns 
     */
    getDesignationList(){
        return this.http.get<Designation[]>(`${this.gatewayMicroservicePathUrl}/${this.designationMicroservicepathUrl}/all`,{observe:'response'});
    }

    /**
     * 
     * @param designation 
     * @returns 
     */
    createDesignation(designation: any){
        console.log(designation)
        return this.http.post<Designation>(`${this.gatewayMicroservicePathUrl}/${this.designationMicroservicepathUrl}/create`,designation,{observe:'response'});
    }

    /**
     * 
     * @param designationId 
     * @returns 
     */
    deleteDesignation(designationId: number){
        return this.http.delete<boolean>(`${this.gatewayMicroservicePathUrl}/${this.designationMicroservicepathUrl}/delete/${designationId}`,{observe:'response'});
    }

    /**
     * 
     * @param updatedDesignation 
     * @returns 
     */
    updateDesignation(updatedDesignation: any){
        return this.http.put<Designation>(`${this.gatewayMicroservicePathUrl}/${this.designationMicroservicepathUrl}/update`,updatedDesignation,{observe:'response'});
    }

    /**
     * 
     * @param designationId 
     * @returns 
     */
    getDesignation(designationId: number){
        console.log(designationId)
        return this.http.get<any>(`${this.gatewayMicroservicePathUrl}/${this.designationMicroservicepathUrl}/get/${designationId}`,{observe:'response'});
    }

    deleteAllSelectedDesignationsById(ids: any[]){
        return this.http.delete<boolean>(`${this.gatewayMicroservicePathUrl}/${this.designationMicroservicepathUrl}/delete/all/${ids}`,{observe:'response'});
    }

}
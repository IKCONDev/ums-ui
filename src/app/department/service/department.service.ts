import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Department } from "src/app/model/Department.model";

@Injectable({
    providedIn : 'root'
})

export class DepartmentService{

    gatewayMicroservicePathUrl: string = 'http://localhost:8012';
    departmentMicroservicepathUrl: string = 'departments';

    constructor(private http: HttpClient){
        
    }

    /**
     * 
     * @returns 
     */
    getDepartmentList(){
        return this.http.get<Department[]>(`${this.gatewayMicroservicePathUrl}/${this.departmentMicroservicepathUrl}/all`,{observe:'response'});
    }

    /**
     * 
     * @param newDepartment 
     * @returns 
     */
    saveDepartment(newDepartment: any){
        console.log(newDepartment)
        return this.http.post<Department>(`${this.gatewayMicroservicePathUrl}/${this.departmentMicroservicepathUrl}/save`,newDepartment,{observe:'response'});
    }

    /**
     * 
     * @param departmentId 
     * @returns 
     */
    deleteDepartment(departmentId: number){
        return this.http.delete<boolean>(`${this.gatewayMicroservicePathUrl}/${this.departmentMicroservicepathUrl}/delete/${departmentId}`,{observe:'response'});
    }

    /**
     * 
     * @param updatedDepartment 
     * @returns 
     */
    updateDepartment(updatedDepartment: any){
        return this.http.put<Department>(`${this.gatewayMicroservicePathUrl}/${this.departmentMicroservicepathUrl}/updated`,updatedDepartment,{observe:'response'});
    }

    /**
     * 
     * @param departmentId 
     * @returns 
     */
    getDepartment(departmentId: number){
        return this.http.get<Department>(`${this.gatewayMicroservicePathUrl}/${this.departmentMicroservicepathUrl}/${departmentId}`,{observe:'response'});
    }

}
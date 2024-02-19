import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Department } from "src/app/model/Department.model";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn : 'root'
})

export class DepartmentService{

    gatewayMicroservicePathUrl: string;
    departmentMicroservicepathUrl: string;
    /**
     * 
     * @param http 
     */
    constructor(private http: HttpClient){
       this.gatewayMicroservicePathUrl = environment.apiURL
       this.departmentMicroservicepathUrl = 'departments';
    }

    /**
     * 
     * @returns 
     */
    getDepartmentList(){
        return this.http.get<Department[]>(`${this.gatewayMicroservicePathUrl}/${this.departmentMicroservicepathUrl}/all`,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          )});
    }

    /**
     * 
     * @returns 
     */
    getActiveDepartmentList(){
        return this.http.get<Department[]>(`${this.gatewayMicroservicePathUrl}/${this.departmentMicroservicepathUrl}/all/active`,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          )});
    }

    /**
     * 
     * @param newDepartment 
     * @returns 
     */
    saveDepartment(newDepartment: any){
        return this.http.post<Department>(`${this.gatewayMicroservicePathUrl}/${this.departmentMicroservicepathUrl}/save`,newDepartment,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          )});
    }

    /**
     * 
     * @param departmentId 
     * @returns 
     */
    deleteDepartment(departmentId: number){
        return this.http.delete<boolean>(`${this.gatewayMicroservicePathUrl}/${this.departmentMicroservicepathUrl}/delete/${departmentId}`,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          )});
    }

    /**
     * 
     * @param updatedDepartment 
     * @returns 
     */
    updateDepartment(updatedDepartment: any){
        return this.http.put<Department>(`${this.gatewayMicroservicePathUrl}/${this.departmentMicroservicepathUrl}/update`,updatedDepartment,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          )});
    }

    /**
     * 
     * @param departmentId 
     * @returns 
     */
    getDepartment(departmentId: number){
        return this.http.get<any>(`${this.gatewayMicroservicePathUrl}/${this.departmentMicroservicepathUrl}/${departmentId}`,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          )});
    }

    /**
     * 
     * @param ids 
     * @returns 
     */
    deleteSelectedDepartmentsById(ids: any[]){
        return this.http.delete<boolean>(`${this.gatewayMicroservicePathUrl}/${this.departmentMicroservicepathUrl}/delete/all/${ids}`,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          )});
    }

}
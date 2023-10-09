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

    getDepartmentList(){
        return this.http.get<Department[]>(`${this.gatewayMicroservicePathUrl}/${this.departmentMicroservicepathUrl}/all`,{observe:'response'});
    }

}
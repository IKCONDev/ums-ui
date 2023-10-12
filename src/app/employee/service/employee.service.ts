import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Employee } from "src/app/model/Employee.model";

@Injectable({
    providedIn : 'root'
})

export class EmployeeService{

    gatewayMicroservicePathUrl: string = 'http://localhost:8012';
    employeeMicroservicepathUrl: string = 'employees';

    constructor(private http: HttpClient){
        
    }
    getAll(){
        return this.http.get<Employee[]>(`${this.gatewayMicroservicePathUrl}/${this.employeeMicroservicepathUrl}/get-all`,{observe : 'response'});
    }
}

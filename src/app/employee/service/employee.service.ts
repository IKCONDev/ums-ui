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
        return this.http.get<Employee[]>(`${this.gatewayMicroservicePathUrl}/${this.employeeMicroservicepathUrl}/all`,{observe : 'response'});
    }
    createEmployee(employee : any){

        return this.http.post<Employee>(`${this.gatewayMicroservicePathUrl}/${this.employeeMicroservicepathUrl}/saveEmployee`,employee,{observe : 'response'});
    }
    updateEmployee(employee : Employee){
        return this.http.put<Employee>(`${this.gatewayMicroservicePathUrl}/${this.employeeMicroservicepathUrl}/update`,employee,{observe : 'response'});
    }

    deleteEmployee(id: number){
        return this.http.delete(`${this.gatewayMicroservicePathUrl}/${this.employeeMicroservicepathUrl}/save`,{observe : 'response'});
    }
    getEmployeeWithDepartment(employeeid : number){
        return this.http.delete(`${this.gatewayMicroservicePathUrl}/${this.employeeMicroservicepathUrl}/get/{employeeid}`,{observe : 'response'});

    }

}


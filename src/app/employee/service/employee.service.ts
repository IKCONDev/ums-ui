import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Employee } from "src/app/model/Employee.model";

@Injectable({
    providedIn: 'root'
})

export class EmployeeService {

    gatewayMicroservicePathUrl: string = 'http://localhost:8012';
    employeeMicroservicepathUrl: string = 'employees';

    constructor(private http: HttpClient) {

    }
    
    /**
     * 
     * @returns 
     */
    getAll() {
        return this.http.get<[]>(`${this.gatewayMicroservicePathUrl}/${this.employeeMicroservicepathUrl}/all`, {
            observe: 'response', headers: new HttpHeaders({
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            }
            )
        });
    }

    /**
     * 
     * @param employee 
     * @returns 
     */
    createEmployee(employee: any) {
        return this.http.post<Employee>(`${this.gatewayMicroservicePathUrl}/${this.employeeMicroservicepathUrl}/saveEmployee`, employee, {
            observe: 'response', headers: new HttpHeaders({
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            }
            )
        });
    }

    /**
     * 
     * @param employee 
     * @returns 
     */
    updateEmployee(employee: any) {
        console.log(employee)
        return this.http.put<any>(`${this.gatewayMicroservicePathUrl}/${this.employeeMicroservicepathUrl}/update`, employee, {
            observe: 'response', headers: new HttpHeaders({
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            }
            )
        });
    }

    /**
     * 
     * @param id 
     * @returns 
     */
    deleteEmployee(id: number) {
        return this.http.delete(`${this.gatewayMicroservicePathUrl}/${this.employeeMicroservicepathUrl}/delete/${id}`, {
            observe: 'response', headers: new HttpHeaders({
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            }
            )
        });
    }

    /**
     * 
     * @param employeeid 
     * @returns 
     */
    getEmployeeWithDepartment(employeeid: number) {
        return this.http.get<any>(`${this.gatewayMicroservicePathUrl}/${this.employeeMicroservicepathUrl}/get/${employeeid}`, {
            observe: 'response', headers: new HttpHeaders({
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            }
            )
        });
    }

    getEmployee(employeeEmailId: String) {
        return this.http.get<any>(`${this.gatewayMicroservicePathUrl}/${this.employeeMicroservicepathUrl}/${employeeEmailId}`, {
            observe: 'response', headers: new HttpHeaders({
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            }
            )
        });
    }

    getUserStatusEmployees(isUser: boolean){
        return this.http.get<Employee[]>(`${this.gatewayMicroservicePathUrl}/${this.employeeMicroservicepathUrl}/getemployee-status/${isUser}`, {
            observe: 'response', headers: new HttpHeaders({
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            }
            )
        });
    }

    /**
     * 
     * @param employee 
     * @returns 
     */
    deleteAllEmployee(employee: any[]) {
        return this.http.delete(`${this.gatewayMicroservicePathUrl}/${this.employeeMicroservicepathUrl}/deleteAll/${employee}`, {
            observe: 'response', headers: new HttpHeaders({
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            }
            )
        });
    }

    getReporteesDataOfEmployee(emailId: string){
        return this.http.get<Employee[]>(`${this.gatewayMicroservicePathUrl}/${this.employeeMicroservicepathUrl}/${emailId}/reportees`, {
            observe: 'response', headers: new HttpHeaders({
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            }
            )
        });
    }
   
    getAllEmployeeStatus(){
        let isUser = false;
        return this.http.get<Employee[]>(`${this.gatewayMicroservicePathUrl}/${this.employeeMicroservicepathUrl}/getemployee-status/${isUser}`, {
            observe: 'response', headers: new HttpHeaders({
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            }
            )
        });
        
    }
    getAllEmployeesByAttendeeEmailId(emailIds: string[]){
        return this.http.get<Employee[]>(`${this.gatewayMicroservicePathUrl}/${this.employeeMicroservicepathUrl}/attendees/${emailIds}`, {
            observe: 'response', headers: new HttpHeaders({
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            }
            )
        });
        
    }

}


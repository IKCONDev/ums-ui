import { Department } from "./Department.model";
import { Designation } from "./Designation.model";

export class Employee{

    //EmployeeVO properties same as backend EmployeeVO class
    id: number;
    employeeOrgId:string;
    teamsUserId: string;
    firstName: string;
    lastName: string;
    email: string;
    designation : string;
    empDesignation: Designation;
    department: Department;
    createdDateTime: string;
    modifiedDateTime: string;
    createdBy: string;
    modifiedBy: string;
    createdByEmailId: string;
    modifiedByEmailId: string;
    
}
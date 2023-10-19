import { Department } from "./Department.model";

export class Employee{
    id: number;
    employeeOrgId:string;
    teamsUserId: string;
    firstName: string;
    lastName: string;
    email: string;
    designation : string;
    department: Department;
    createdDateTime: string;
    modifiedDateTime: string;
    createdBy: string;
    modifiedBy: string;
    createdByEmailId: string;
    modifiedByEmailId: string;
    
}
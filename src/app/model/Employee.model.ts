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
    reportingManager: string;
    designation : string;
    empDesignation: Designation;
    department: Department;
    departmentId: number;
    gender: string;
    createdDateTime: string;
    modifiedDateTime: string;
    createdBy: string;
    modifiedBy: string;
    createdByEmailId: string;
    modifiedByEmailId: string;
    departmentName: string;
    user: boolean;
    dateOfJoining:Date;
    reportingManagerName: string;
    employeeStatus : string;
    batchProcessStatus: string;
    enableBatchProcessing: boolean;

}
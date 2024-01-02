import { Department } from "./Department.model";
import { Designation } from "./Designation.model";

export class EmployeeVO{
    
     id : number;
	 employeeOrgId : string;
     teamsUserId : string;
     firstName : string;
     lastName : string;
     email : string;
	 reportingManager : string;
	 gender : string;
     designation  : string;
     empDesignation :Designation;
	 departmentId : number;
	 department: Department;
	 dateOfJoining : string;
	 user : boolean;
}
import { Department } from "./Department.model";

export interface Employee{
    id: number;
    teamsUserId: string;
    firstName: string;
    lastName: string;
    email: string;
    designation : string;
    userRole: string;
    twoFactorAuthentication: boolean;
    department: Department
}
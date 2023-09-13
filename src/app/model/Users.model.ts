import { Employee } from "./Employee.model";

export interface Users{
     email: string;
	 encryptedPassword: string;
	 userRole: string;
	 otpCode: number;
	twoFactorAuthentication: boolean
	employee: Employee
}
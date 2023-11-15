import { Employee } from "./Employee.model";
import { Role } from "./Role.model";

export interface Users{
     email: string;
	 encryptedPassword: string;
	 userRoles: Role[];
	 otpCode: number;
	 twoFactorAuthentication: boolean;
	 employee: Employee;
	 profilePic: Blob;
	 active: boolean;
	 loginAttempts: number;

}
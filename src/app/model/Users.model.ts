import { Employee } from "./Employee.model";
import { Role } from "./Role.model";
import { UserRoleMenuItemPermissionMap } from "./UserRoleMenuItemPermissionMap.model";

export interface Users{
	 id: number;
     email: string;
	 encryptedPassword: string;
	 userRoles: Role[];
	 otpCode: number;
	 twoFactorAuthentication: boolean;
	 employee: Employee;
	 profilePic: Blob;
	 active: boolean;
	 loginAttempts: number;
	 userRoleMenuItemPermissionMap: UserRoleMenuItemPermissionMap;

	 //other props related to employee of the user
	 firstName: string,
	 lastName: string,
	 userOrgId: string

}
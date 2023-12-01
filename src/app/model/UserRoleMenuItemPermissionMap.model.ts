import { MenuItem } from "./MenuItem.model";

export class UserRoleMenuItemPermissionMap{
   
    id: number;
	email: string;
    roleId: number;
    menuItemIdList: string;
    permissionIdList: string;
    createdDateTime: string;
    modifiedDateTime: string;
    createdBy: string;
    modifiedBy : string;
    createdByEmailId: string;
    modifiedByEmailId: string;
    menuItem: MenuItem;
    
}
import { MenuItem } from "./MenuItem.model";
import { Permission } from "./Permission.model";

export class Role extends Object{
    roleId:number;
    roleName: string;
    roleStatus: string;
    roleDescription: string;
    permission: Permission;
    menuItems: MenuItem[];
    createdBy: string;
    createdByEmailId: string;
    createdDateTime : Date;
    modifiedBy: string;
    modifiedByEmailId: string;
    modifiedDateTime: Date;

    /**
     *
     */
    constructor() {
        super();
    }

}
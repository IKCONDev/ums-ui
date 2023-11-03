export class Role extends Object{
    roleId:number;
    roleName: string;
    roleStatus: string;
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
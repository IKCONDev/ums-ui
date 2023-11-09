export class UMSConstants {
    
    /**
     * Define the Role Constants. The Roles are actually retrieved from database and the constants are used in validating the front end.
     * These roles may become void, when the dynamic implementation of roles and permissions is implemented.
     */

    constructor(public ROLE_SUPER_ADMIN: string = 'SUPER_ADMIN', public ROLE_DEPT_HEAD: String = 'DEPARTMENT_HEAD',
    public ROLE_ADMIN: String = 'ADMIN',public ROLE_MANAGER: String = 'MANAGER', public ROLE_TEAM_LEAD: String = 'TEAM_LEAD',
    public ROLE_TEAM_MEMBER: String = 'TEAM_MEMBER'){}

}
export class UMSConstants {
    
    /**
     * Define the Role Constants. The Roles are actually retrieved from database and the constants are used in validating the front end.
     * These roles may become void, when the dynamic implementation of roles and permissions is implemented.
     */

    ROLE_SUPER_ADMIN: String = 'SUPER_ADMIN';
    ROLE_ADMIN: String = 'ADMIN';
    ROLE_DEPT_HEAD: String = 'DEPARTMENT_HEAD';
    ROLE_MANAGER: String = 'MANAGER';
    ROLE_TEAM_LEAD: String = 'TEAM_LEAD';
    ROLE_TEAM_MEMBER: String = 'TEAM_MEMBER';

}
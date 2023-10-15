export class Organization{
    orgId: number;
    orgName: string;
	orgEmailId: string;
	orgContact :string;
    orgContactPerson: string;
	orgContactPersonEmail: string;
	orgFunctionalType: string;
	orgLogo: Blob;
    orgWebsite: string;
	orgCountry: string;
	orgTimeZone: string;
	orgAddress: string;
	orgSuperAdminEmailId: string;
	defaultReplyEmailId : string;
	createdDateTime : string;
	modifiedDateTime : string;
	createdBy : string;
	modifiedBy : string;
    createdByEmailId : string;
	modifiedByEmailId : string;

    /**
     *
     */
    constructor() {
        
    }
}
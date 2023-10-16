import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Organization } from "src/app/model/Organization.model";

@Injectable({
    providedIn: 'root'
})
export class OrganizationService{

    private apiGatewayUrl = 'http://localhost:8012';

    private adminMicroserviceOrganizationPathUrl = 'org';
    private saveOrganisationUrl='/save';
    private updateOrganisationUrl='/update';

    constructor(private http: HttpClient){
        
    }

    getOrganization(id: number){
        return this.http.get<Organization>(`${this.apiGatewayUrl}/${this.adminMicroserviceOrganizationPathUrl}/${id}`,{observe: 'response'})
    }

    saveOrganization(org){
        console.log(org)
        return this.http.post<Organization>(`${this.apiGatewayUrl}/${this.adminMicroserviceOrganizationPathUrl}${this.saveOrganisationUrl}`,org,{observe:'response'})
    }
    updateOrganisation(org){
        console.log(org)
        return this.http.put<Organization>(`${this.apiGatewayUrl}/${this.adminMicroserviceOrganizationPathUrl}${this.updateOrganisationUrl}`,org,{observe:'response'})
    }

}
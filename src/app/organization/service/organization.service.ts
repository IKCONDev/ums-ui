import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Organization } from "src/app/model/Organization.model";

@Injectable({
    providedIn: 'root'
})
export class OrganizationService{

    private apiGatewayUrl = 'http://localhost:8012';

    private adminMicroserviceOrganizationPathUrl = 'org';

    constructor(private http: HttpClient){
        
    }

    getOrganization(id: number){
        return this.http.get<Organization>(`${this.apiGatewayUrl}/${this.adminMicroserviceOrganizationPathUrl}/${id}`,{observe: 'response'})
    }



}
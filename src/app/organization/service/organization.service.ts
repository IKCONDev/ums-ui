import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Organization } from "src/app/model/Organization.model";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class OrganizationService {

    private apiGatewayUrl: string;
    private adminMicroserviceOrganizationPathUrl: string;
    private saveOrganisationUrl: string;
    private updateOrganisationUrl: string;
    private saveOrganizationPic: string;
    private deleteOrganizationPic: string;
    private finalUrlForDeletingPic: string;

    /**
     * 
     * @param http 
     */
    constructor(private http: HttpClient) {
    this.apiGatewayUrl = environment.apiURL;
    this.adminMicroserviceOrganizationPathUrl = 'org';
    this.saveOrganisationUrl = '/save';
    this.updateOrganisationUrl = '/update';
    this.saveOrganizationPic='/saveOrgPic';
    this.deleteOrganizationPic='/deleteOrgPic';
    this.finalUrlForDeletingPic =this.apiGatewayUrl+"/"+this.adminMicroserviceOrganizationPathUrl+this.deleteOrganizationPic;
    }

    /**
     * 
     * @param id 
     * @returns 
     */
    getOrganization(id: number) {
        return this.http.get<Organization>(`${this.apiGatewayUrl}/${this.adminMicroserviceOrganizationPathUrl}/${id}`, {
            observe: 'response', headers: new HttpHeaders({
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            }
            )
        });
    }

    /**
     * 
     * @param org 
     * @returns 
     */
    saveOrganization(org) {
        return this.http.post<Organization>(`${this.apiGatewayUrl}/${this.adminMicroserviceOrganizationPathUrl}${this.saveOrganisationUrl}`, org, {
            observe: 'response', headers: new HttpHeaders({
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            }
            )
        });
    }

    /**
     * 
     * @param org 
     * @returns 
     */
    updateOrganization(org) {
        return this.http.put<Organization>(`${this.apiGatewayUrl}/${this.adminMicroserviceOrganizationPathUrl}${this.updateOrganisationUrl}`, org, {
            observe: 'response', headers: new HttpHeaders({
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            }
            )
        });
    }

    /**
     * 
     * @param orgPic 
     * @returns 
     */
    saveOrgPic(orgPic:any){
    const userdata = new FormData();
     userdata.append('orgPic',orgPic)
     return this.http.post<Organization>(`${this.apiGatewayUrl}/${this.adminMicroserviceOrganizationPathUrl}${this.saveOrganizationPic}`, userdata, {
        observe: 'response', headers: new HttpHeaders({
            'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
        }
        )
    });
    }

    deleteOrgPic(orgId){
        return this.http.delete<any>(this.finalUrlForDeletingPic ,{
          params: { orgId: orgId },
          headers: new HttpHeaders({
            'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
          }),
          observe: 'response'
        }
      );
      }
      
}
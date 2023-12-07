import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Organization } from "src/app/model/Organization.model";

@Injectable({
    providedIn: 'root'
})
export class OrganizationService {

    private apiGatewayUrl = 'http://localhost:8012';
    private adminMicroserviceOrganizationPathUrl = 'org';
    private saveOrganisationUrl = '/save';
    private updateOrganisationUrl = '/update';
    private saveOrganizationPic='/saveOrgPic';
    private deleteOrganizationPic='/deleteOrgPic';

    /**
     * 
     * @param http 
     */
    constructor(private http: HttpClient) {

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
        console.log(org)
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
        console.log(org)
        return this.http.put<Organization>(`${this.apiGatewayUrl}/${this.adminMicroserviceOrganizationPathUrl}${this.updateOrganisationUrl}`, org, {
            observe: 'response', headers: new HttpHeaders({
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            }
            )
        });
    }
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

    finalUrlForDeletingPic:any=this.apiGatewayUrl+"/"+this.adminMicroserviceOrganizationPathUrl+this.deleteOrganizationPic;
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
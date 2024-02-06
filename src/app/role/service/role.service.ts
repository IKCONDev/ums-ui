import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Role } from "src/app/model/Role.model";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn : 'root'
})

export class RoleService {

    apiGateWayMicroservicePathURL: string;
    roleMicroservicePathURL: string;
    
    constructor(private http: HttpClient){
        this.apiGateWayMicroservicePathURL= environment.apiURL;
        this.roleMicroservicePathURL = 'roles';
    }

    /**
     * 
     * @param role 
     * @returns 
     */
    createRole(role: any){
        return this.http.post<Role>(`${this.apiGateWayMicroservicePathURL}/${this.roleMicroservicePathURL}/create`,role,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          )});

    }

    /**
     * 
     * @returns 
     */
    getAllRoles(){
        return this.http.get<Role[]>(`${this.apiGateWayMicroservicePathURL}/${this.roleMicroservicePathURL}/all`,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          )});
    }

    /**
     * 
     * @param role 
     * @returns 
     */
    updateRole(role : any){
        return this.http.put<Role>(`${this.apiGateWayMicroservicePathURL}/${this.roleMicroservicePathURL}/update`,role,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          )});
    }

    /**
     * 
     * @param id 
     * @returns 
     */
    getRole(id : number){
        return this.http.get<any>(`${this.apiGateWayMicroservicePathURL}/${this.roleMicroservicePathURL}/${id}`,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          )});
    }

    /**
     * 
     * @param id 
     * @returns 
     */
    // deleteRole(id: number){
    //     return this.http.delete<boolean>(`${this.apiGateWayMicroservicePathURL}/${this.roleMicroservicePathURL}/delete/${id}`,{observe:'response',headers: new HttpHeaders({
    //         'Authorization':'Bearer '+localStorage.getItem('jwtToken')
    //       }
    //       )});
    // }

    /**
     * 
     */
    deleteSelectedRoles(ids: any[]){
        return this.http.delete<boolean>(`${this.apiGateWayMicroservicePathURL}/${this.roleMicroservicePathURL}/${ids}`,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          )});
    }

}


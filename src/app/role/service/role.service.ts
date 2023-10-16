import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Role } from "src/app/model/Role.model";

@Injectable({
    providedIn : 'root'
})

export class RoleService {

    apiGateWayMicroservicePathURL: string = 'http://localhost:8012';
    roleMicroservicePathURL: string = 'roles';
    
    constructor(private http: HttpClient){
    }

    createRole(role: any){
        return this.http.post<Role>(`${this.apiGateWayMicroservicePathURL}/${this.roleMicroservicePathURL}/create`,role,{observe:'response'});

    }

    getAllRoles(){
        return this.http.get<Role[]>(`${this.apiGateWayMicroservicePathURL}/${this.roleMicroservicePathURL}/all`,{observe:'response'});
    }

    updateRole(role : any){

    }

    

  

}


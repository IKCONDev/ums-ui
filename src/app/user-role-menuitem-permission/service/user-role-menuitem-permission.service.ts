import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UserRoleMenuItemPermissionMap } from "src/app/model/UserRoleMenuItemPermissionMap.model";

@Injectable({
    providedIn : "root"
})

export class UserRoleMenuItemPermissionService{

    private gatewayUrl = 'http://localhost:8012';
    private adminMicroserviceUserRPMControllerPathUrl = 'userRoleMenuPermissionMap';

    constructor(private http: HttpClient){}


    /**
     * 
     * @param emailId 
     */
    findUserRoleMenuitemPermissionMapsByUserId(emailId: string){
        return this.http.get<UserRoleMenuItemPermissionMap[]>(`${this.gatewayUrl}/${this.adminMicroserviceUserRPMControllerPathUrl}/all/${emailId}`,{observe:'response',
         headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
         })
        })
    }

}
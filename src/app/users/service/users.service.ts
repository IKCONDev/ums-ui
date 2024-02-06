import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Users } from "src/app/model/Users.model";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn : "root"
})

export class UserService{

    gatewayMicroservicePathUrl: string;
    userMicroservicepathUrl: string;

    constructor(private http:HttpClient){
       this.gatewayMicroservicePathUrl = environment.apiURL;
       this.userMicroservicepathUrl  = 'user';
    }

    getAll(){
        return this.http.get<Users[]>(`${this.gatewayMicroservicePathUrl}/${this.userMicroservicepathUrl}/all`,{observe:'response'}); 
    }

    update(user : any){
        return this.http.put(`${this.gatewayMicroservicePathUrl}/${this.userMicroservicepathUrl}/update`,user,{observe:'response'});
    }
    createUser(user : any){
        return this.http.post<Users>(`${this.gatewayMicroservicePathUrl}/${this.userMicroservicepathUrl}/save`,user,{observe:'response'});
    }
    
    getSingleUser(email : String){
        return this.http.get<Users>(`${this.gatewayMicroservicePathUrl}/${this.userMicroservicepathUrl}/getUser/${email}`,{observe:'response'});
    }
    deleteUser(email : String){
        return this.http.delete(`${this.gatewayMicroservicePathUrl}/${this.userMicroservicepathUrl}/delete/${email}`,{observe :'response'});
    }


}
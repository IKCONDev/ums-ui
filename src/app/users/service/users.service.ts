import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Users } from "src/app/model/Users.model";

@Injectable({
    providedIn : "root"
})

export class UserService{

    private gatewayMicroservicePathUrl: string = 'http://localhost:8012';
    private userMicroservicepathUrl: string = 'user';

    constructor(private http:HttpClient){}

    getAll(){
        return this.http.get<Users[]>(`${this.gatewayMicroservicePathUrl}/${this.userMicroservicepathUrl}/all`,{observe:'response'}); 
    }

    update(email:String,user : Users){
        console.log("came to update"+ user);
        return this.http.put(`${this.gatewayMicroservicePathUrl}/${this.userMicroservicepathUrl}/update/{email}`,user,{observe:'response'});
    }


}
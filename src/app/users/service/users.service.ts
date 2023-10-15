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

    update(user : Users){
        console.log("came to update"+ user);
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
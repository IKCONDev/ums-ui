import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HomeService {

  gatewayUrl = "http://localhost:8012"
  authenticationMicroservicePathUrl = '/users';
  finalHttpUrl = this.gatewayUrl+this.authenticationMicroservicePathUrl;

    constructor(private http: HttpClient){}

    getDemoText(){
        return this.http.get<String>(`${this.finalHttpUrl}/demo`,{headers: new HttpHeaders({
          'Authorization':'Bearer '+localStorage.getItem('jwtToken')
        })});
      }

}
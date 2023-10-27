import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Notification } from "src/app/model/Notification.model";

@Injectable({
    providedIn:'root'
})
export class NotificationService{

    constructor(private http: HttpClient){

    }

    private apiGatewayUrl = 'http://localhost:8012';
    private notificationMicroservicePathUrl = 'notification';

    getTopTenNotificationsByUserId(emailId: string){
        return this.http.get<Notification[]>(`${this.apiGatewayUrl}/${this.notificationMicroservicePathUrl}/all/${emailId}`,{observe:'response'});
    }

}
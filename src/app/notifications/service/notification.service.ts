import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Notification } from "src/app/model/Notification.model";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn:'root'
})
export class NotificationService{

    private apiGatewayUrl: string;
    private notificationMicroservicePathUrl: string;

    constructor(private http: HttpClient){
        this.apiGatewayUrl = environment.apiURL;
        this.notificationMicroservicePathUrl = 'notification';
    }

    /**
     * 
     * @param emailId 
     * @returns 
     */
    getTopTenNotificationsByUserId(emailId: string){
        return this.http.get<Notification[]>(`${this.apiGatewayUrl}/${this.notificationMicroservicePathUrl}/all/${emailId}`,
        {observe:'response'});
    }

    /**
     * 
     * @param notification 
     * @returns 
     */
    updateNotification(notification : Notification){
        return this.http.put<Notification>(`${this.apiGatewayUrl}/${this.notificationMicroservicePathUrl}/update`,notification,
        {observe:'response'});
    }

    /**
     * 
     * @param email 
     * @returns 
     */
    findNotificationCount(email: string){
        return this.http.get<number>(`${this.apiGatewayUrl}/${this.notificationMicroservicePathUrl}/count/${email}`,
        {observe:'response'});
    }

}
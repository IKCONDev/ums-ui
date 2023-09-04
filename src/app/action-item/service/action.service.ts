import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

import { ActionItems } from 'src/app/model/actionitem.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActionService {

    //private gatewayUrl1 = 'http://localhost:8080/api'
    private gatewayUrl1 ='http://localhost:8012'
    private actionItemsMicroservicePathUrl = '/actions';
    private finalHttpUrl = this.gatewayUrl1+this.actionItemsMicroservicePathUrl;  
    private actionItemsUrl = 'get-actions';
    private updateActionItemUrl='update-action';
    private getActionItem = 'get-action-item';
    private saveActionItemUrl = 'create';
    private deleteActionItemUrl = 'delete-action';

    constructor(private http:HttpClient){}

    getAllActionItems(){
        return this.http.get<ActionItems[]>(`${this.finalHttpUrl}/${this.actionItemsUrl}`,{observe:'response'});
    }
    getActionItemById(id : number){
      return this.http.get<ActionItems>(`${this.finalHttpUrl}/${this.getActionItem}/${id}`,{observe:'response'});

    }
    updateActionItem(actionItem:ActionItems){
      
       return this.http.put(`${this.finalHttpUrl}/${this.updateActionItemUrl}/${actionItem.id}`,actionItem,{observe:'response'});
    }
    saveActionItem(actionItem:ActionItems){
      
      return this.http.post<ActionItems>(`${this.finalHttpUrl}/${this.saveActionItemUrl}`,actionItem,{observe:'response'});
       
    }
    deleteActionItem(id:number){


      //console.log(action.id);
      return this.http.delete<number>(`${this.finalHttpUrl}/${this.deleteActionItemUrl}/${id}`,{observe:'response'});
    }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

import { ActionItems } from 'src/app/model/actionitem.model';
import { Observable } from 'rxjs';
import { Task } from 'src/app/model/task.model';

@Injectable({
  providedIn: 'root',
})
export class ActionService {

    //private gatewayUrl1 = 'http://localhost:8080/api'
    private gatewayUrl ='http://localhost:8012'
    private actionItemsMicroservicePathUrl = '/actions';
    private tasksURL ='task';
    private finalHttpUrl = this.gatewayUrl+this.actionItemsMicroservicePathUrl;  
    private actionItemsUrl = 'get-actions';
    private updateActionItemUrl='update-action';
    private getActionItem = 'get-action-item';
    private saveActionItemUrl = 'create';
    private deleteActionItemUrl = 'delete-action';
    private deleteSelectedAction='ac-items/delete';
    private getTaskDetails ='get-tasks';
    private getUserSpecificActionItems='fetch-actions';

    constructor(private http:HttpClient){}

    getAllActionItems(){
        return this.http.get<ActionItems[]>(`${this.finalHttpUrl}/${this.actionItemsUrl}`,{observe:'response'});
    }
    getActionItemById(id : number){
      return this.http.get<ActionItems>(`${this.finalHttpUrl}/${this.getActionItem}/${id}`,{observe:'response'});

    }
    updateActionItem(actionItem:ActionItems){
      
       return this.http.put(`${this.finalHttpUrl}/${this.updateActionItemUrl}/${actionItem.actionItemId}`,actionItem,{observe:'response'});
    }
    saveActionItem(actionItem:ActionItems){
      
      return this.http.post<ActionItems>(`${this.finalHttpUrl}/${this.saveActionItemUrl}`,actionItem,{observe:'response'});
       
    }
    getUserActionItems(email:string){
       return this.http.get<ActionItems[]>(`${this.finalHttpUrl}/${this.getUserSpecificActionItems}/${email}`,{observe:'response'});
    }
    getAlltaskDetails(){
        
      return this.http.get<Task[]>(`${this.gatewayUrl}/${this.tasksURL}/${this.getTaskDetails}`,{observe:'response'});
   }
    deleteActionItem(id:number){


      //console.log(action.id);
      return this.http.delete<number>(`${this.finalHttpUrl}/${this.deleteActionItemUrl}/${id}`,{observe:'response'});
    }
    
    deleteSelectedActionItems(actionItems:any[]){
      
      return this.http.delete<boolean>(`${this.finalHttpUrl}/${this.deleteSelectedAction}/${actionItems}`,{observe:'response'});

    }
  }
    
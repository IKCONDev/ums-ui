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
    private actionItemsMicroservicePathUrl = 'actions';
    private taskMicroServicePathUrl ='task'
    private getTaskDetails ='get-tasks';
   
    constructor(private http:HttpClient){}

    getAllActionItems(){
        return this.http.get<ActionItems[]>(`${this.gatewayUrl}/${this.actionItemsMicroservicePathUrl}/all`,{observe:'response'});
    }
    getActionItemById(id : number){
      return this.http.get<ActionItems>(`${this.gatewayUrl}/${this.actionItemsMicroservicePathUrl}/${id}`,{observe:'response'});

    }
    updateActionItem(actionItem:ActionItems){
      
       return this.http.put(`${this.gatewayUrl}/${this.actionItemsMicroservicePathUrl}/update/${actionItem.actionItemId}`,actionItem,{observe:'response'});
    }
    saveActionItem(actionItem:ActionItems){
      
      return this.http.post<ActionItems>(`${this.gatewayUrl}${this.actionItemsMicroservicePathUrl}/save`,actionItem,{observe:'response'});
       
    }
    getUserActionItems(email:string){
       return this.http.get<ActionItems[]>(`${this.gatewayUrl}/${this.actionItemsMicroservicePathUrl}/all/${email}`,{observe:'response'});
    }
    getAlltaskDetails(){
        
      return this.http.get<Task[]>(`${this.gatewayUrl}/${this.taskMicroServicePathUrl}/all`,{observe:'response'});
   }
    deleteActionItem(id:number){


      //console.log(action.id);
      return this.http.delete<number>(`${this.gatewayUrl}/${this.actionItemsMicroservicePathUrl}/${id}`,{observe:'response'});
    }
    
    deleteSelectedActionItems(actionItemsIds:any[]){
      
      return this.http.delete<boolean>(`${this.gatewayUrl}/${this.actionItemsMicroservicePathUrl}/${actionItemsIds}`,{observe:'response'});

    }
  }
    
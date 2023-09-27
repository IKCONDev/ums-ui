import { Injectable,OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Task } from 'src/app/model/task.model';

@Injectable({
    providedIn:'root'
})
export class TaskService{

    constructor(private http:HttpClient){}

    private gatewayMicroservicePathUrl ="http://localhost:8012";
    private taskMicroservicePathUrl ="task";

    getAlltasks(){  
        return this.http.get<Task[]>(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/all`,{observe:'response'});
    }
    getTask(id:number){
        return this.http.get<Task>(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/${id}`,{observe:'response'});
    }
    getTaskByUserId(email:string){
        return this.http.get<Task[]>(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/get/${email}`,{observe:'response'});

    }
    updateTask(task:Task){
         return this.http.put(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/update/${task.id}`,task,{observe:'response'});
    }
    deleteAllTasksByTaskIds(taskIds:any[]){
        return this.http.delete<boolean>(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/deleteAll/${taskIds}`,{observe:'response'});
    }


   

}
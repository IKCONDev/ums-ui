import { Injectable,OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Task } from 'src/app/model/Task.model';

@Injectable({
    providedIn:'root'
})
export class TaskService{

    /**
     * 
     * @param http 
     */
    constructor(private http:HttpClient){}

    private gatewayMicroservicePathUrl ="http://localhost:8012";
    private taskMicroservicePathUrl ="task";

    /**
     * 
     * @returns 
     */
    getAlltasks(){  
        return this.http.get<Task[]>(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/all`,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          )})
    }

    /**
     * 
     * @param id 
     * @returns 
     */
    getTask(id:number){
        return this.http.get<Task>(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/${id}`,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          )})
    }

    /**
     * 
     * @param email 
     * @returns 
     */
    getTaskByUserId(email:string){
        return this.http.get<Task[]>(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/getall/${email}`,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          )})

    }

    /**
     * 
     * @param task 
     * @returns 
     */
    updateTask(task:Task){
         return this.http.put(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/update/${task.taskId}`,task,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          )})
    }

    /**
     * 
     * @param task 
     * @returns 
     */
    deleteAllTasksByTaskIds(task:any[]){
        return this.http.delete<boolean>(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/deleteAll/${task}`,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          )})
    }
    
    /**
     * 
     * @param email 
     * @returns 
     */
    getAssignedTasksOfUser(email:string){
        return this.http.get<Task[]>(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/assigned/${email}`,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          )})
    }
    deleteTaskById(taskId:any){

        return this.http.delete<boolean>(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/delete/${taskId}`,{observe:'response',headers: new HttpHeaders({
            'Authorization':'Bearer '+localStorage.getItem('jwtToken')
          }
          )})
         
    }

    
}
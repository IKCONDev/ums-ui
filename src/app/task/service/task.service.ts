import { Injectable,OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Task } from 'src/app/model/task.model';

@Injectable({
    providedIn:'root'
})
export class TaskService{

    constructor(private http:HttpClient){}

    private gatewayUrl ="http://localhost:8012";
    private tasksUrl ="/task";
    private finalHttpUrl= this.gatewayUrl+this.tasksUrl;
    private getTasksDetails="get-tasks";
    private getSingleTask="get-task";
    private deleteallTasks="task/delete";
    private updateDetails="update-task";
    private getUserSpecificTasks="getuser-task";

    getAlltaskDetails(){
        
        return this.http.get<Task[]>(`${this.finalHttpUrl}/${this.getTasksDetails}`,{observe:'response'});
    }
    getSingleTaskDetails(id:number){
        return this.http.get<Task>(`${this.finalHttpUrl}/${this.getSingleTask}/${id}`,{observe:'response'});
    }
    getUserTaskDetails(email:string){
        return this.http.get<Task[]>(`${this.finalHttpUrl}/${this.getUserSpecificTasks}/${email}`,{observe:'response'});

    }
    updateTaskDetails(task:Task){
         return this.http.put(`${this.finalHttpUrl}/${this.updateDetails}/${task.id}`,task,{observe:'response'});
    }
    deleteSelectedTasks(tasks:any[]){
      
        return this.http.delete<boolean>(`${this.finalHttpUrl}/${this.deleteallTasks}/${tasks}`,{observe:'response'});
  
    }


   

}
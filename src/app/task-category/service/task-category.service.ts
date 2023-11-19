import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Task } from 'src/app/model/Task.model';
import { TaskCategory } from 'src/app/model/TaskCategory.model';

@Injectable({
  providedIn: 'root'
})
export class TaskCategoryService {

  /**
   * 
   * @param http 
   */
  constructor(private http: HttpClient) { }

  private gatewayMicroservicePathUrl = "http://localhost:8012";
  private taskCategoryMicroservicePathUrl = "taskCategory";

  findTaskCategories(){
    return this.http.get<TaskCategory[]>(`${this.gatewayMicroservicePathUrl}/${this.taskCategoryMicroservicePathUrl}/all`,{observe: 'response', headers: new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
    }
    )
  })
  }

  createTaskCategory(taskcategory: any){
    return this.http.post<TaskCategory>(`${this.gatewayMicroservicePathUrl}/${this.taskCategoryMicroservicePathUrl}/create`,taskcategory,{observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  updateTaskCategory(taskcategory: any){
    return this.http.put<TaskCategory>(`${this.gatewayMicroservicePathUrl}/${this.taskCategoryMicroservicePathUrl}/update`,taskcategory,{observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  findTaskCatgeoryById(taskCategoryId: number){
    return this.http.get<TaskCategory>(`${this.gatewayMicroservicePathUrl}/${this.taskCategoryMicroservicePathUrl}/${taskCategoryId}`,{observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  deleteSelectedTaskCategories(taskCategoryIds: number[]){
    return this.http.delete<boolean>(`${this.gatewayMicroservicePathUrl}/${this.taskCategoryMicroservicePathUrl}/delete/${taskCategoryIds}`,{observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

}
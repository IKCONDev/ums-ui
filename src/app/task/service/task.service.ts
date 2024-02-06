import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Task } from 'src/app/model/Task.model';
import { TaskCategory } from 'src/app/model/TaskCategory.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private gatewayMicroservicePathUrl: string;
  private taskMicroservicePathUrl: string;
  /**
   * 
   * @param http 
   */
  constructor(private http: HttpClient) {
    this.gatewayMicroservicePathUrl = environment.apiURL;
    this.taskMicroservicePathUrl = "task";
   }


  /**
   * 
   * @param task 
   * @returns 
   */
  createTask(task: any) {
    return this.http.post<Task>(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/create`, task, {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  /**
   * 
   * @returns 
   */
  getAlltasks() {
    return this.http.get<Task[]>(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/all`, {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  /**
   * 
   * @param id 
   * @returns 
   */
  getTask(id: number) {
    return this.http.get<Task>(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/${id}`, {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  /**
   * 
   * @param email 
   * @returns 
   */
  getTaskByUserId(email: string, filter_TaskName: string,
    filter_Priority: string, filter_Email_Organizer: string,
    filter_StartDate: string,
    filter_EndDate: string) {
    if (
      (filter_TaskName !== '' && filter_TaskName !== 'null') ||
      (filter_Priority !== '' && filter_Priority !== 'null') ||
      (filter_StartDate !== '' && filter_StartDate !== 'null') ||
      (filter_EndDate !== '' && filter_EndDate !== 'null') ||
      (filter_Email_Organizer !== '' && filter_Email_Organizer !== 'null')
    ) {

      //prepare request parameters
      let params = new HttpParams()
        .set('taskTitle', filter_TaskName)
        .set('taskPriority', filter_Priority)
        .set('taskOrganizer', filter_Email_Organizer)
        .set('taskStartDate', filter_StartDate)
        .set('taskEndDate', filter_EndDate)

      return this.http.get<Task[]>(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/getall/${email}`, {
        observe: 'response', headers: new HttpHeaders({
          'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
        }
        ), params: params
      })
    } else {
      return this.http.get<Task[]>(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/getall/${email}`, {
        observe: 'response', headers: new HttpHeaders({
          'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
        }
        )
      })
    }
  }

  /**
   * 
   * @param task 
   * @returns 
   */
  updateTask(task: any) {
    return this.http.put(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/update/${task.taskId}`, task, {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  /**
   * 
   * @param task 
   * @returns 
   */
  deleteAllTasksByTaskIds(task: any[]) {
    return this.http.delete<boolean>(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/deleteAll/${task}`, {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  /**
   * 
   * @param email 
   * @returns 
   */
  getAssignedTasksOfUser(email: string, assignedTaskTitleFilter: string,
    assignedTaskPriorityFilter: string,
    //assignedTaskOrganizerFilter: string,
    assignedTaskStartDateFilter: string,
    assignedTaskEndDateFilter: string) {
    if (
      (assignedTaskTitleFilter !== '' && assignedTaskTitleFilter !== 'null') ||
      (assignedTaskPriorityFilter !== '' && assignedTaskPriorityFilter !== 'null') ||
      //(assignedTaskOrganizerFilter !== '' && assignedTaskOrganizerFilter !== 'null') ||
      (assignedTaskStartDateFilter !== '' && assignedTaskStartDateFilter !== 'null') ||
      (assignedTaskEndDateFilter !== '' && assignedTaskEndDateFilter !== 'null')
    ) {

      //prepare request parameters
      let params = new HttpParams()
        .set('taskTitle', assignedTaskTitleFilter)
        .set('taskPriority', assignedTaskPriorityFilter)
        //.set('taskOrganizer', assignedTaskOrganizerFilter)
        .set('taskStartDate', assignedTaskStartDateFilter)
        .set('taskEndDate', assignedTaskEndDateFilter)
      return this.http.get<Task[]>(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/assigned/${email}`, {
        observe: 'response', headers: new HttpHeaders({
          'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
        }
        ), params: params
      })
    }else {
      return this.http.get<Task[]>(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/assigned/${email}`, {
        observe: 'response', headers: new HttpHeaders({
          'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
        }
        )
      })
    }
    }
    deleteTaskById(taskId: any){

      return this.http.delete<boolean>(`${this.gatewayMicroservicePathUrl}/${this.taskMicroservicePathUrl}/delete/${taskId}`, {
        observe: 'response', headers: new HttpHeaders({
          'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
        }
        )
      })

    }

    findTaskCategories(){
      return this.http.get<TaskCategory[]>(`${this.gatewayMicroservicePathUrl}/taskCategory/all`,{observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
    }


  }
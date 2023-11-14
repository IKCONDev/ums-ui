import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';

import { ActionItems } from 'src/app/model/Actionitem.model';
import { Observable } from 'rxjs';
import { Task } from 'src/app/model/Task.model';


@Injectable({
  providedIn: 'root',
})
export class ActionService {

  private gatewayUrl = 'http://localhost:8012'
  private actionItemsMicroservicePathUrl = 'actions';
  private taskMicroServicePathUrl = 'task'

  /**
   * 
   * @param http 
   */
  constructor(private http: HttpClient) { }

  /**
   * 
   * @returns 
   */
  getAllActionItems() {
    return this.http.get<ActionItems[]>(`${this.gatewayUrl}/${this.actionItemsMicroservicePathUrl}/all`, {
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
  getActionItemById(id: number) {
    return this.http.get<ActionItems>(`${this.gatewayUrl}/${this.actionItemsMicroservicePathUrl}/${id}`, {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })

  }

  /**
   * 
   * @param actionItem 
   * @returns 
   */
  updateActionItem(actionItem: ActionItems) {
    console.log(actionItem)
    return this.http.put(`${this.gatewayUrl}/${this.actionItemsMicroservicePathUrl}/update/${actionItem.actionItemId}`, actionItem, {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  /**
   * 
   * @param actionItem 
   * @returns 
   */
  saveActionItem(actionItem: ActionItems) {

    return this.http.post<ActionItems>(`${this.gatewayUrl}/${this.actionItemsMicroservicePathUrl}/save`, actionItem, {
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
  getUserActionItemsByUserId(email: string) {
    return this.http.get<ActionItems[]>(`${this.gatewayUrl}/${this.actionItemsMicroservicePathUrl}/all/${email}`, {
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
    return this.http.get<Task[]>(`${this.gatewayUrl}/${this.taskMicroServicePathUrl}/all`, {
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
  deleteActionItem(id: number) {
    //console.log(action.id);
    return this.http.delete<number>(`${this.gatewayUrl}/${this.actionItemsMicroservicePathUrl}/delete/${id}`, {
      observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  /**
   * 
   * @param actionItemsIds 
   * @returns 
   */
  deleteSelectedActionItemsByIds(actionItemsIds: any[]) {
    return this.http.delete<boolean>(`${this.gatewayUrl}/${this.actionItemsMicroservicePathUrl}/deleteAll/${actionItemsIds}`, {
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
  getActionItemByUserId(email: string, actionItemNameFilter: string, actionItemOwnerFilter: string,
    actionItemStartDateFilter: string,
    actionItemEndDateFilter: string) {
    if
      (actionItemNameFilter !== '' ||
      actionItemOwnerFilter !== '' ||
      actionItemStartDateFilter !== '' || 
      actionItemEndDateFilter !== '') {

      let params = new HttpParams()
        .set('actionItemTitle', actionItemNameFilter)
        .set('actionItemOwner', actionItemOwnerFilter)
        .set('actionItemStartDate', actionItemStartDateFilter)
        .set('actionItemEndDate', actionItemEndDateFilter)

      return this.http.get<ActionItems[]>(`${this.gatewayUrl}/${this.actionItemsMicroservicePathUrl}/all/${email}`, {
        observe: 'response', headers: new HttpHeaders({
          'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
        }
        ),params:params
      })
    } else {
      console.log('executed - else')
      return this.http.get<ActionItems[]>(`${this.gatewayUrl}/${this.actionItemsMicroservicePathUrl}/all/${email}`, {
        observe: 'response', headers: new HttpHeaders({
          'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
        }
        )
      })
    }
  }
}

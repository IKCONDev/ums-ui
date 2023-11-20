import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Task } from 'src/app/model/Task.model';
import { TaskCategory } from 'src/app/model/TaskCategory.model';
import { Permission } from 'src/app/model/Permission.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  /**
   * 
   * @param http 
   */
  constructor(private http: HttpClient) { }

  private gatewayMicroservicePathUrl = "http://localhost:8012";
  private permissionMicroservicePathUrl = "permission";

  findAllPermissions(){
    return this.http.get<Permission[]>(`${this.gatewayMicroservicePathUrl}/${this.permissionMicroservicePathUrl}/all`,{observe: 'response', headers: new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
    }
    )
  })
  }

  createPermission(Permission: any){
    return this.http.post<Permission>(`${this.gatewayMicroservicePathUrl}/${this.permissionMicroservicePathUrl}/create`,Permission,{observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  updatePermission(Permission: any){
    return this.http.put<Permission>(`${this.gatewayMicroservicePathUrl}/${this.permissionMicroservicePathUrl}/update`,Permission,{observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  findPermissionById(permissionId: number){
    return this.http.get<Permission>(`${this.gatewayMicroservicePathUrl}/${this.permissionMicroservicePathUrl}/${permissionId}`,{observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  deleteSelectedPermissions(permissionIds: number[]){
    return this.http.delete<boolean>(`${this.gatewayMicroservicePathUrl}/${this.permissionMicroservicePathUrl}/delete/${permissionIds}`,{observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

}
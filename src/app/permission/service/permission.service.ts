import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Task } from 'src/app/model/Task.model';
import { TaskCategory } from 'src/app/model/TaskCategory.model';
import { Permission } from 'src/app/model/Permission.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private gatewayMicroservicePathUrl : string;
  private permissionMicroservicePathUrl : string;

  /**
   * 
   * @param http 
   */
  constructor(private http: HttpClient) {
    this.gatewayMicroservicePathUrl = environment.apiURL
    this.permissionMicroservicePathUrl = "permission";
   }

  getAllPermissions(){
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

  deleteSelectedPermission(permissionId: number){
    return this.http.delete<boolean>(`${this.gatewayMicroservicePathUrl}/${this.permissionMicroservicePathUrl}/delete/${permissionId}`,{observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

}
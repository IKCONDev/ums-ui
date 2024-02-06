import { Injectable } from "@angular/core";
import { HttpClient , HttpHeaders,HttpResponse} from "@angular/common/http";
import { BatchDetails } from "src/app/model/BatchDetails.model";
import { MenuItem } from "src/app/model/MenuItem.model";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn : 'root'
})

export class AppMenuItemService {
     /**
   * 
   * @param http 
   */
     gatewayMicroservicePathUrl: string;
     menuItemMicroservicePathUrl: string;
  constructor(private http: HttpClient) {
      this.gatewayMicroservicePathUrl = environment.apiURL;
      this.menuItemMicroservicePathUrl = "menuitem";
   }


  findMenuItems(){
    return this.http.get<MenuItem[]>(`${this.gatewayMicroservicePathUrl}/${this.menuItemMicroservicePathUrl}/all`,{observe: 'response', headers: new HttpHeaders({
      'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
    }
    )
  })
  }

  createMenuItem(menuItem: any){
    return this.http.post<MenuItem>(`${this.gatewayMicroservicePathUrl}/${this.menuItemMicroservicePathUrl}/create`,menuItem,{observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  updateMenuItem(menuItem: any){
    return this.http.put<MenuItem>(`${this.gatewayMicroservicePathUrl}/${this.menuItemMicroservicePathUrl}/update`,menuItem,{observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  findMenuItemById(menuItemId: number){
    return this.http.get<MenuItem>(`${this.gatewayMicroservicePathUrl}/${this.menuItemMicroservicePathUrl}/${menuItemId}`,{observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  findMenuItemByName(menuItemName: string){
    return this.http.get<MenuItem>(`${this.gatewayMicroservicePathUrl}/${this.menuItemMicroservicePathUrl}/get/${menuItemName}`,{observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  deleteSelectedMenuItems(menuItemIds: number[]){
    return this.http.delete<boolean>(`${this.gatewayMicroservicePathUrl}/${this.menuItemMicroservicePathUrl}/delete/${menuItemIds}`,{observe: 'response', headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
      }
      )
    })
  }

  
}
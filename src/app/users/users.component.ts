import { Component , OnInit, Output} from '@angular/core';
import { UserService } from './service/users.service';
import { Users } from '../model/Users.model';
import { MsalInterceptorAuthRequest } from '@azure/msal-angular';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent  implements OnInit{

  @Output() title:string='Users';

  userList :Users[];

  constructor(private userService:UserService){}

  ngOnInit(): void {
     this.userService.getAll().subscribe(
          response=>{
            
            this.userList = response.body;
            console.log(this.userList);

        });

  }
  checkToggleButton(user : Users, i :number){
    
    var table = document.getElementById("myTable")
    var rows = table.getElementsByTagName("tr");

    for(var i=0; i<rows.length;i++){
      var row =rows[i];
      //var checkbox = row.querySelector("input[type='checkbox']") as HTMLInputElement;
      var checkbox = document.getElementById('slider'+i) as HTMLInputElement;
      console.log(checkbox)
      if(checkbox.checked == true){
        console.log("selected");
        user.active = true;
        this.userService.update(user.email,user);
      }
      else{
        user.active = false;
        this.userService.update(user.email,user);
      }
      
    }


  }
  
 

}

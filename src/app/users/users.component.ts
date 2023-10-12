import { Component , OnInit, Output} from '@angular/core';
import { UserService } from './service/users.service';
import { Users } from '../model/Users.model';
import { MsalInterceptorAuthRequest } from '@azure/msal-angular';
import { HttpStatusCode } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent  implements OnInit{

  @Output() title:string='Users';

  userList :Users[];

  constructor(private userService:UserService, private toastr : ToastrService){}

  ngOnInit(): void {
     this.userService.getAll().subscribe(
          response=>{
            
            this.userList = response.body;
            console.log(this.userList);

        });

  }
  userDetails: any;
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
        this.userService.update(user.email,user).subscribe(res =>{
            this.userDetails =res.body;
        });
      }
      else{
         user.active = false;
         this.userService.update(user.email,user).subscribe(res =>{
        this.userDetails =res.body;
       });
     }
 
  }
  }
  addUserObj ={
     
    email : '',
    userRoles: [
      {
        roleId:1,
        roleName:''
      }
    ],
    active : false,
    otpCode: 0,
    twoFactorAuthentication: false,
    profilePic: null

  }
  createUser(){
     
    //this.addUserObj.userRoles.at(0).roleName; 
    this.userService.createUser(this.addUserObj).subscribe(
       response =>{
        this.addUserObj = response.body;
        if(response.status == HttpStatusCode.Created){
           this.toastr.success("user added successfully");
           document.getElementById('closeAddModal').click();
           setTimeout(()=>{
              window.location.reload();
          },1000)
        }
         
       }
    )

  }
  
  /**
   * display existing user
   */
  existingUserObj={

    email : '',
    userRoles: null,
    active : false,
    otpCode: 0,
    twoFactorAuthentication: false,
    profilePic: null

  }
  fetchOneUser(email : string){
    console.log(email);
    this.userService.getSingleUser(email).subscribe(
      response =>{
        this.existingUserObj = response.body;
        console.log(this.existingUserObj.email);
      }
    )


  }

}

  
 


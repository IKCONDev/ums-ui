import { Component , OnInit, Output} from '@angular/core';
import { UserService } from './service/users.service';
import { Users } from '../model/Users.model';
import { MsalInterceptorAuthRequest } from '@azure/msal-angular';
import { HttpStatusCode } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { RoleService } from '../role/service/role.service';
import { Role } from '../model/Role.model';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent  implements OnInit{

  @Output() title:string='Users';

  userList :Users[];

  constructor(private userService:UserService, private toastr : ToastrService, private roleService: RoleService){}

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
        this.userService.update(user).subscribe(res =>{
            this.userDetails =res.body;
        });
      }
      else{
         user.active = false;
         this.userService.update(user).subscribe(res =>{
        this.userDetails =res.body;
       });
     }
 
  }
  }
  addUserObj ={
     
    email : '',
    userRoles: [
      {
        roleId:0,
        roleName:''
      }
    ],
    active : false,
    otpCode: 0,
    twoFactorAuthentication: false,
    profilePic: null

  }
  createUser(){
    
    let isEmailId = true;
    let isRoleName = true;

    if(!this.isEmailValid ){
       var valid = this.validateUserEmailId();
       isEmailId = valid;
    }
    if(!this.isRoleNameValid){
       var valid = this.validateuserRole();
       isRoleName = valid;

    }

    if(isEmailId == true && isRoleName == true){
       
      this.userService.createUser(this.addUserObj).subscribe(
        response =>{
         
         if(response.status == HttpStatusCode.Created){
           this.addUserObj = response.body;
            this.toastr.success("user added successfully");
            document.getElementById('closeAddModal').click();
            setTimeout(()=>{
               window.location.reload();
           },1000)
         }
          
        }
     )

    }

    //this.addUserObj.userRoles.at(0).roleName; 
    

  }
  
  /**
   * display existing user
   */
  existingUserObj={

    email : '',
    userRoles: [
      {
        roleId:0,
        roleName:''
      }
    ],
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

  /**
   * get roles
   */
  roles : Role[];
  getAllRoles(){
    this.roleService.getAllRoles().subscribe(
      response=>{
         this.roles = response.body;
         console.log(" roles:"+ this.roles);
      }
    )
      
  }
  /**
   * 
   * @param user
   */
  updateUser(user : any){
    
    this.userService.update(user).subscribe(
       response=>{
         var userRecord = response.body;
         if(response.status == HttpStatusCode.Created){
             this.toastr.success("updated user successfully");
         }
         else{
            this.toastr.error("update user failed");
         }
       }
    )

  }

  /**
   *  delete user
   */
  removeUser(useremailId : any){
    var isconfirmed = window.confirm("Are you sure, you really want to delete records ?");
    if(isconfirmed){

      this.userService.deleteUser(useremailId).subscribe(
        response=>{
           var userRecord = response.body;
           if(response.status == HttpStatusCode.Ok){
             this.toastr.success("Deleted successfully");
           }
        }
       )
    }
    

  }

  /**
   * validate create User
   */
 isEmailValid = false;
 useremilIdErrorInfo ="";
 validateUserEmailId(){
   if(this.addUserObj.email == ''){
      this.useremilIdErrorInfo = "emailId is required";
      this.isEmailValid = false;
   }
   else{
     this.useremilIdErrorInfo = '';
     this.isEmailValid = true;
   }
   return this.isEmailValid;
  }

 isRoleNameValid = false;
 roleErrorInfo ="";
 validateuserRole(){
   if(this.addUserObj.userRoles.at(0).roleName == ''){
     this.roleErrorInfo = 'role is required';
     this.isRoleNameValid = false;
   }
   else if(this.addUserObj.userRoles.at(0).roleName == 'select'){
    this.roleErrorInfo = 'role is required';
    this.isRoleNameValid = false;
   }
   else{
      this.roleErrorInfo = '';
      this.isEmailValid = true;
   }
   return this.isEmailValid;
 }


}

  
 


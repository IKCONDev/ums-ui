import { AfterViewInit, Component , OnDestroy, OnInit, Output} from '@angular/core';
import { UserService } from './service/users.service';
import { Users } from '../model/Users.model';
import { MsalInterceptorAuthRequest } from '@azure/msal-angular';
import { HttpStatusCode } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { RoleService } from '../role/service/role.service';
import { Role } from '../model/Role.model';
import { MeetingService } from '../meetings/service/meetings.service';
import { Router } from '@angular/router';
import { EmployeeService } from '../employee/service/employee.service';
import { Employee } from '../model/Employee.model';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent  implements OnInit,AfterViewInit,OnDestroy{

  private table: any;
  loggedInUser: string = localStorage.getItem('email');
  loggedInUserRole = localStorage.getItem('userRole');
  @Output() title:string='Users';

  userList :Users[];
  userDetails: any;

  /**
   * 
   * @param userService 
   * @param toastr 
   * @param roleService 
   * @param meetingsService 
   * @param router 
   * @param employeeservice 
   */
  constructor(private userService:UserService, private toastr : ToastrService, private roleService: RoleService, 
    private meetingsService: MeetingService,private router: Router, private employeeservice:EmployeeService){}

    /**
     * 
     */
  ngOnInit(): void {

    // if(this.loggedInUserRole != 'ADMIN' && this.loggedInUserRole != 'SUPER_ADMIN'){
    //   this.router.navigateByUrl('/unauthorized')
    // }
    this.getAllEmployeesWithStatus();
    this.getAllUsers();
  }

  /**
   * 
   */
  getAllUsers(){

    this.userService.getAll().subscribe(
      response=>{
        
        this.userList = response.body;
        console.log(this.userList);

    });

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      $(document).ready(() => {
        this.table = $('#myTable').DataTable({
          paging: true,
          searching: true, // Enable search feature
          pageLength: 7,
          order: [[1,'asc']]
          // Add other options here as needed
        });
      });
    },100)
  }

  ngOnDestroy(): void {
    if (this.table) {
      this.table.destroy();
    }
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
        
        user.active = true;
        
      }
      else{
         user.active = false;
         console.log("de-selected")
     }
 
  }
  }

  /**
   * 
   * @param user 
   * @param i 
   */
  checkUserTogglebuttonEnabled(user : Users, i : number){

    //var table = document.getElementById('myTable');
   // var rows = table.getElementsByTagName("tr");
    var checkbox = document.getElementById('slider'+i) as HTMLInputElement
    console.log("checkbox method is executed"+ "slider"+i +checkbox.checked);
    if(!checkbox.checked){
       user.active = false;
       this.userService.update(user).subscribe(res =>{
          this.userDetails = res.body;
       })
       localStorage.setItem('slider','false')
    }
    else{
       user.active = true;
       this.userService.update(user).subscribe(res =>{
        this.userDetails = res.body;
     })

    }
  }
  addUserObj ={
     
    email : '',
    userRoles: [
      {
        roleId:0,
        roleName:'',
        roleStatus:'Active'
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
    console.log("create user Object"+this.addUserObj.userRoles[0]);
    //set role based on role id
    console.log(this.addUserObj.userRoles[0].roleId)
    this.roles.filter( role =>{
      console.log(role.roleId)
      if(this.addUserObj.userRoles[0].roleId.toString() === role.roleId.toString()){
        this.addUserObj.userRoles[0].roleName = role.roleName;
        console.log(role.roleName);
      }
    })
      this.addUserObj.userRoles[0].roleStatus = 'Active';
      this.userService.createUser(this.addUserObj).subscribe(
        response =>{
         
         if(response.status == HttpStatusCode.Created){
           this.addUserObj = response.body;
            this.toastr.success("User added successfully");
            document.getElementById('closeAddModal').click();
            setTimeout(()=>{
               window.location.reload();
           },1000);
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
  //   this.roles.filter(role =>{
  //     if(this.existingUserObj.userRoles[0].roleId.toString() === role.roleId.toString()){
  //        this.existingUserObj.userRoles[0].roleName = role.roleName;
  //     }
  //  })
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
  updateUser(existinguser: any){
    console.log(existinguser)
    let isEmailIdValid = true;
    let isRoleValid = true;
    if(!this.isUpdateRoleNameValid){
      var valid = this.validateUpdateUserRole();
      isRoleValid = valid;
    }
    if(isRoleValid == true){
      console.log(this.existingUserObj)
      console.log(this.existingUserObj.userRoles[0].roleId);
      this.roles.forEach(role =>{
        console.log('loop ---' +role.roleId+"--- "+role.roleName)
        //get role name of the role id and attach to existing user
       if(role.roleId == this.existingUserObj.userRoles[0].roleId){
        this.existingUserObj.userRoles[0].roleName = role.roleName;
        console.log(role.roleName)
        }
      })
      console.log(this.existingUserObj.userRoles[0].roleId)
      console.log(this.existingUserObj.userRoles[0].roleName)
      console.log(this.existingUserObj)
      this.userService.update(this.existingUserObj).subscribe(
         response=>{
           var userRecord = response.body;
           if(response.status == HttpStatusCode.Created){
               this.toastr.success("User updated successfully");
               document.getElementById('closeUpdateModal').click();
               setTimeout(() => {
                 window.location.reload();
                },1000);
           }
           else{
              this.toastr.error("Error occured while updating user");
           }
         }
      )

    }
  
  }

  /**
   *  delete user
   */
  removeUser(useremailId : any){
    var isconfirmed = window.confirm("Are you sure, you really want to delete user ?");
    if(isconfirmed){

      this.userService.deleteUser(useremailId).subscribe(
        response=>{
           var userRecord = response.body;
           if(response.status == HttpStatusCode.Ok){
             this.toastr.success("User deleted successfully");
             setTimeout(() => {
              window.location.reload();
             },1000);
           }
           else{
            this.toastr.error("Error occued while deleting user");
          }
         
        });
    }
    else{
      this.toastr.warning("User not deleted");
    }
    

  }

  /**
   * validate create User
   */
 isEmailValid = false;
 useremailIdErrorInfo ="";
 validateUserEmailId(){
   var emailRegExp = /^[A-Za-z0-9._]{2,30}[0-9]{0,9}@[A-Za-z]{3,12}[.]{1}[A-Za-z.]{2,6}$/;
    //emailRegExp.test(this.addUserObj.email)===false
   if(this.addUserObj.email == ''){
      this.useremailIdErrorInfo = "Email ID is required";
      this.isEmailValid = false;
   }
   else{
     this.useremailIdErrorInfo = '';
     this.isEmailValid = true;
   }
   return this.isEmailValid;
  }

 isRoleNameValid = false;
 roleErrorInfo ="";
 validateuserRole(){
   if(this.addUserObj.userRoles.at(0).roleId ==0 ){
     this.roleErrorInfo = 'Role is required';
     this.isRoleNameValid = false;
   }
   else if(this.addUserObj.userRoles.at(0).roleName.toString() === 'select'){
    this.roleErrorInfo = 'Role is required for select' ;
    this.isRoleNameValid = false;
   }
   else{
      this.roleErrorInfo = '';
      this.isRoleNameValid= true;
   }
   return this.isRoleNameValid;
 }

 clearErrorMessages(){
  //$(".modal-body input").val("")
    this.roleErrorInfo ='';
    this.useremailIdErrorInfo = '';
    this.addUserObj.userRoles.at(0).roleId = 0;
    this.addUserObj.email = '';
    this.isEmailValid = false;
    this.isRoleNameValid = false;
 }

 userEmailIdList: string[];
  /**
   * get the list of active users
   */
  getActiveUMSUsersEmailIdList() {
    //perform an AJAX call to get list of users
    var isActive: boolean = true;
    this.meetingsService.getActiveUserEmailIdList().subscribe({
      next: (response) => {
        this.userEmailIdList = response.body;
        console.log(response.body);
        console.log(this.userEmailIdList);
      }, error: (error) => {
        if (error.status === HttpStatusCode.Unauthorized) {
          this.router.navigateByUrl("/session-timeout")
        }
      }//error
    })
  }
  employeeData: Employee[];
  getAllEmployees() {
    this.employeeservice.getAll().subscribe({
      next: response => {
        this.employeeData = response.body;
        console.log(this.employeeData);
      },
      error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      }
    })
  }
employeeWithStatus :Employee[]
getAllEmployeesWithStatus(){
   this.employeeservice.getAllEmployeeStatus().subscribe({
      next : response =>{
         this.employeeWithStatus = response.body;
         console.log( this.employeeWithStatus)
      },
      error: error => {
        if(error.status === HttpStatusCode.Unauthorized){
          this.router.navigateByUrl('/session-timeout');
        }
      }
   })
}
isUpdateRoleNameErrorInfo ='';
isUpdateRoleNameValid = false;
validateUpdateUserRole(){
   if(this.existingUserObj.userRoles.at(0).roleId ==0){
     this.isUpdateRoleNameErrorInfo = 'Role is required';
     this.isUpdateRoleNameValid = false;
   }
   else{
    this.isUpdateRoleNameErrorInfo = '';
    this.isUpdateRoleNameValid = true;
   }
   return this.isUpdateRoleNameValid;
}

}

  
 


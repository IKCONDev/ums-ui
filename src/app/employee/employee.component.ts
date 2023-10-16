import { Component, Output ,OnInit} from '@angular/core';
import { EmployeeService } from './service/employee.service';
import { Employee } from '../model/Employee.model';
import { HttpStatusCode } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { DepartmentService } from '../department/service/department.service';
import { Department } from '../model/Department.model';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit{
  
  @Output() title:string='Employees';

 addEmployee ={

    id: 0,
    employeeOrgId:'',
    teamsUserId: '',
    firstName: '',
    lastName: '',
    email: '',
    designation : '',
    departmentId: 0,
    createdDateTime: '',
    modifiedDateTime: '',
    createdBy: '',
    modifiedBy: '',
    createdByEmailId: '',
    modifiedByEmailId: '',
  }

  employeeData : Employee[];

  constructor( private employeeservice : EmployeeService, private toastr : ToastrService, private departmentservice : DepartmentService) {}
  ngOnInit(): void {

    this.getAllEmployees();
    this.getAllDepartments();
   
     
  }

  /**
   *  get all employees in DB
   */

  getAllEmployees(){

    this.employeeservice.getAll().subscribe(
      response =>{

        this.employeeData = response.body;
        console.log(this.employeeData);
    })

  }
  

/***
 * 
 *  create employee
 */
 createdEmployee : Employee;
  


  createEmployee(){

    let isFirstNameValid = true;
    let  isLastNameValid = true;
    let isEmailIdValid = true;
    let  isDepartmentValid = true;
    let  isDesignationValid = true;

    if(!this.isEmployeeFirstNameValid){

      var valid = this.validateEmployeeFirstName();
      isFirstNameValid = valid;
    }
    if(!this.isEmployeeLasttNameValid){
      var valid = this.validateEmployeeLastName();
      isLastNameValid = valid;
    }
    if(!this.isEmployeeEmailIdValid){
      var valid = this.validateEmployeeEmailId();
      isEmailIdValid =valid;

    }
    if(!this.isEmployeeDepartmentValid){
      var valid = this.validateEmployeeDepartment();
      isDepartmentValid = valid;

    }
    if(!this.isEmployeeDesignationtValid){
       var valid = this.validateEmployeeDesignation();
       isDesignationValid = valid;
    }
    
    if(isFirstNameValid == true && isLastNameValid == true && isEmailIdValid == true && isDepartmentValid == true && isDesignationValid == true){
      
      console.log(this.addEmployee);
     this.employeeservice.createEmployee(this.addEmployee).subscribe(
       response =>{
        if(response.status == HttpStatusCode.Created){

          this.createdEmployee = response.body;
          this.toastr.success("Employee created successfully");
        }
          

       }
     )
    }

    
  }

  existingEmployee ={

    id: 0,
    employeeOrgId:'',
    teamsUserId: '',
    firstName: '',
    lastName: '',
    email: '',
    designation : '',
    departmentId :0,
    createdDateTime: '',
    modifiedDateTime: '',
    createdBy: '',
    modifiedBy: '',
    createdByEmailId: '',
    modifiedByEmailId: '',
  }
  
  /**
   * 
   * @param employeeid 
   */
  fetchoneEmployeewithDepartment(employeeid : number){

     this.employeeservice.getEmployeeWithDepartment(employeeid).subscribe(
        response =>{
          this.existingEmployee = response.body;
          console.log(this.existingEmployee);

     });
     for(let employee of this.employeeData){
      for(let department of this.departmentList){
        if(employee.department.departmentId == department.departmentId ){
             employee.department.departmentName = department.departmentName;
             console.log(employee.department.departmentName);
        }
      }
    } 
  }

  /**
   *  get all departmentList
   */
  departmentList : Department[]

  getAllDepartments(){

    this.departmentservice.getDepartmentList().subscribe(
       response=>{
        this.departmentList = response.body;
        console.log(this.departmentList); 
       }
    )
  }
  /**
   * remove employee
   */
  
  removeEmployee(employeeId : number){
    var isconfirmed = window.confirm('Are you sure, you really want to delete the record ?');

    if(isconfirmed){

      this.employeeservice.deleteEmployee(employeeId).subscribe(
        response =>{
            if(response.status == HttpStatusCode.Ok){
                this.toastr.success("record deleted successfully");
            }
        }
     )
 
    }

  }
  /**
   *  update employee
   */
  
  updateEmployee(employee : any){
    
    this.employeeservice.updateEmployee(employee).subscribe(
       response=>{
         var employeerecord = response.body;
         if(response.status == HttpStatusCode.Created){
             this.toastr.success("updated employee successfully");
         }
         else{
            this.toastr.error("update employee failed");
         }
       }
    )

  }
  
  /**
   * 
   * validations for create Employee
   * 
   */
  isEmployeeFirstNameValid = false;
  isEmployeeLasttNameValid = false;
  isEmployeeEmailIdValid = false;
  isEmployeeDepartmentValid = false;
  isEmployeeDesignationtValid = false;
  
  employeeFirstNameErrorInfo = '';
  validateEmployeeFirstName(){

    if(this.addEmployee.firstName == ''){
        this.employeeFirstNameErrorInfo = "first Name is required";
        this.isEmployeeFirstNameValid = false;
    }
    else if(this.addEmployee.firstName.length < 4){
      this.employeeFirstNameErrorInfo = "first Name is required";
      this.isEmployeeFirstNameValid = false;
   
    }
    else{
       this.employeeFirstNameErrorInfo = "";
       this.isEmployeeFirstNameValid = true;
    }
    return this.isEmployeeFirstNameValid;

  }
  employeeLastNameErrorInfo ="";
  validateEmployeeLastName(){

    if(this.addEmployee.lastName == ''){
      this.employeeLastNameErrorInfo = "Last Name is required";
     this. isEmployeeLasttNameValid = false;
  }
  else{
     this.employeeFirstNameErrorInfo = "";
     this. isEmployeeLasttNameValid = true;
  }
     
  return this.isEmployeeLasttNameValid;
  
  
  }

  employeeEmailIdErrorInfo = "";
  validateEmployeeEmailId(){
     if(this.addEmployee.email == ''){
      this.employeeEmailIdErrorInfo = "EmailId is required";
      this.isEmployeeEmailIdValid = false;
     }
     else{
      this.employeeFirstNameErrorInfo = "";
      this.isEmployeeEmailIdValid = true;
     }
     return this.isEmployeeEmailIdValid;  
  }
  employeeDepartmentErrorInfo = "";
  validateEmployeeDepartment(){
     if(this.addEmployee.departmentId < 1 ){
       this.employeeDepartmentErrorInfo = "Department is required"
       this.isEmployeeDepartmentValid = false;

     }
     else{
       this.employeeDepartmentErrorInfo ="";
       this.isEmployeeDepartmentValid = true;
     }
     return this,this.isEmployeeDepartmentValid;

  }

  employeeDesignationErrorInfo = "";

  validateEmployeeDesignation(){

    if(this.addEmployee.designation == ''){
      this.employeeDesignationErrorInfo = "Designation is required"
      this.isEmployeeDesignationtValid = false;

    }
    else{
      this.employeeDesignationErrorInfo ="";
      this.isEmployeeDesignationtValid = true;
    }
    return this.isEmployeeDesignationtValid;
  }

  /**
   * clear Error Message
   */

  clearErrorMessages(){
     this.employeeFirstNameErrorInfo = '';
     this.employeeLastNameErrorInfo = '';
     this.employeeEmailIdErrorInfo = '';
     this.employeeDepartmentErrorInfo = '';
     this.employeeDesignationErrorInfo ='';
  
  }
  /**
   * update employee Validations
   */
  updateFirst
  validateupdateFirstName(){

  }
  validateupdateLastName(){

  }
  validateupdateEmailId(){

  }
  validateUpdateDepartment(){

  }
  validateUpdateDesignation(){

  }
}

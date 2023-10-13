import { Component, Output ,OnInit} from '@angular/core';
import { EmployeeService } from './service/employee.service';
import { Employee } from '../model/Employee.model';
import { HttpStatus } from '@azure/msal-common';
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
  getAllEmployees(){

    this.employeeservice.getAll().subscribe(
      response =>{

        this.employeeData = response.body;
        console.log(this.employeeData);
    })

  }
  
 createdEmployee : Employee;
  createEmployee(){
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

  departmentList : Department[]

  getAllDepartments(){

    this.departmentservice.getDepartmentList().subscribe(
       response=>{
        this.departmentList = response.body;
        console.log(this.departmentList); 
       }
    )
  }
  
  removeEmployee(){

  }
  

}

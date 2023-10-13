import { Component, Output ,OnInit} from '@angular/core';
import { EmployeeService } from './service/employee.service';
import { Employee } from '../model/Employee.model';
import { HttpStatusCode } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit{
  
  @Output() title:string='Employees';

 createdEmployee ={

    id: 0,
    employeeOrgId:'',
    teamsUserId: '',
    firstName: '',
    lastName: '',
    email: '',
    designation : '',
    department:  {
        departmentId: 0,
        departmentName: '',
        departmentCode: '',
        departmentAddress: '',
        departmentHead: '',
        createdBy:'',
        createdByEmailId: '',
        createdDateTime: new Date(),
        modifiedBy : '',
        modifiedDateTime: new Date()
    },
    
    createdDateTime: '',
    modifiedDateTime: '',
    createdBy: '',
    modifiedBy: '',
    createdByEmailId: '',
    modifiedByEmailId: '',
  }

  employeeData : Employee[];

  constructor( private employeeservice : EmployeeService, private toastr : ToastrService) {}
  ngOnInit(): void {

    this.getAllEmployees();
     
  }
  getAllEmployees(){

    this.employeeservice.getAll().subscribe(
      response =>{

        this.employeeData = response.body;
        console.log(this.employeeData);
    })

  }
  
 addedEmployee : Employee;
  createEmployee(){
    console.log(this.createdEmployee);
     this.employeeservice.createEmployee(this.createdEmployee).subscribe(
       response =>{
        if(response.status == HttpStatusCode.Created){

          this.addedEmployee = response.body;
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
    departmentId :1,
    createdDateTime: '',
    modifiedDateTime: '',
    createdBy: '',
    modifiedBy: '',
    createdByEmailId: '',
    modifiedByEmailId: '',
  }
  
  fetchoneEmployeewithDepartment(employeeid : number){
     this.employeeservice.getEmployeeWithDepartment(employeeid).subscribe({



     });
  }
  

}

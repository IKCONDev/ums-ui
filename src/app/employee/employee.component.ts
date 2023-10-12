import { Component, Output ,OnInit} from '@angular/core';
import { EmployeeService } from './service/employee.service';
import { Employee } from '../model/Employee.model';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit{
  
  @Output() title:string='Employees';

  employeeData : Employee[];

  constructor( private employeeservice : EmployeeService) {}
  ngOnInit(): void {

    this.employeeservice.getAll().subscribe(response =>{
        this.employeeData = response.body;
        console.log(this.employeeData);
    })
     
  }
  

}

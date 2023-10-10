import { Component,Output } from '@angular/core';
import { Department } from '../model/Department.model';
import { DepartmentService } from './service/department.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {

  @Output() title:string='Departments';
  departmentList: Department[];

  constructor(private departmentService: DepartmentService){
    //get all departments List on component initialization
    this.getAllDepartments();
    
  }

  /**
   * ngOnInit() executes on component initialization everytime
   */
  ngOnInit(): void {
      
  }


  /**
   * get list of all departments from Database and display to admin in UI
   */
  getAllDepartments(){
    this.departmentService.getDepartmentList().subscribe(
      (response)=>{
        this.departmentList = response.body;
        console.log(this.departmentList)
      }
    )
  }


}

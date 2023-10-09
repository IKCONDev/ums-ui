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
    this.departmentList = this.getAllDepartments();
  }

  ngOnInit(): void {
      //get all departments List on component initialization
      this.departmentList = this.getAllDepartments();
  }


  /**
   * 
   */
  getAllDepartments(): Department[]{
    this.departmentService.getDepartmentList().subscribe(
      (response)=>{
        console.log(response.body)
        //this.departmentList = response.body;
      }
    )
    return this.departmentList;
  }


}

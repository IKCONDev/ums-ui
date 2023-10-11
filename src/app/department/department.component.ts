import { Component,Output } from '@angular/core';
import { Department } from '../model/Department.model';
import { DepartmentService } from './service/department.service';
import { OnInit } from '@angular/core';
import { HttpStatusCode } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {

  @Output() title:string='Departments';
  departmentList: Department[];
  addDepartment = {
    departmentName: '',
    departmentCode: '',
    departmentAddress: '',
    departmentHead: '',
    createdBy:'',
    createdByEmailId: ''
  }
  updateDepartment: Department;

  constructor(private departmentService: DepartmentService,
    private toastr: ToastrService){
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

  
  /**
   * create a new department
   */
  savedDepartment: Department;
  createDepartment(){
    //set createdBy
    this.addDepartment.createdBy = localStorage.getItem('firstName')+' '+localStorage.getItem('lastName');
    this.addDepartment.createdByEmailId = localStorage.getItem('email');
    this.departmentService.saveDepartment(this.addDepartment).subscribe(
      (response)=> {
        if(response.status === HttpStatusCode.Created){
          this.savedDepartment = response.body;
        this.toastr.success('Department added successfully.')
          setTimeout(()=>{
            window.location.reload();
          },2000)
        }
      }
    )
  }

  /**
   * delete a department
   * @param departmentId 
   */
  removeDepartment(departmentId: number){
    this.departmentService.deleteDepartment(departmentId).subscribe(
      (response) => {
        console.log('exuected')
        if(response.status === HttpStatusCode.Ok){
          var result = response.body;
          this.toastr.success('Department '+departmentId+' deleted successfully.')
          setTimeout(()=>{
            window.location.reload();
          },2000)
        }
      }
    )
  }

  /**
   * 
   * @param departmentId 
   */
  existingDepartment = {
    departmentName: '',
    departmentCode: '',
    departmentAddress: '',
    departmentHead: '',
    modifiedBy:'',
    modifiedDateTime:''
  };

  /**
   * get an exisitng department from DB
   * @param departmentId 
   */
  fetchOneDepartment(departmentId: number){
    this.departmentService.getDepartment(departmentId).subscribe(
      (response=>{
        if(response.status === HttpStatusCode.Ok){
         this.existingDepartment.departmentName = response.body.departmentName;
         this.existingDepartment.departmentCode = response.body.departmentCode;
         this.existingDepartment.departmentHead = response.body.departmentHead;
         this.existingDepartment.departmentAddress = response.body.departmentAddress;
          console.log(this.existingDepartment.departmentName);
        }
      })
    )
  }


  /**
   * update an existing department
   */
  modifyDepartment(){
    this.existingDepartment.modifiedBy = localStorage.getItem('firstName')+' '+localStorage.getItem('lastName');
    this.departmentService.updateDepartment(this.existingDepartment).subscribe(
      (response) => {
        console.log(response.body);
      }
    )
  }

  /*
  closeDepartmentModal(){
    this.addDepartment.departmentName= '';
    this.addDepartment.departmentCode = '';
    this.addDepartment.departmentHead = '';
    this.addDepartment.departmentAddress = '';
  }
  */

  //validations for updateDepartment
  existingDepartmentNameErrorInfo: string = ''
  validateExistingDepartmentName(){
    if(this.existingDepartment.departmentName === ''){
      this.existingDepartmentNameErrorInfo = 'Department name is required';
    }else if(this.existingDepartment.departmentName.length < 3){
      this.existingDepartmentNameErrorInfo = 'department name should have minimum of 3 chars.';
    }else{
      this.existingDepartmentNameErrorInfo = '';
    }
  }

  existingDepartmentHeadErrorInfo: string = ''
  validateExistingDepartmentHead(){
    if(this.existingDepartment.departmentHead === ''){
      this.existingDepartmentHeadErrorInfo = 'Department head is required';
    }else{
      this.existingDepartmentHeadErrorInfo = '';
    }
  }

  existingDepartmentCodeErrorInfo:string = '';
  validateExistingDepartmentCode(){
    if(this.existingDepartment.departmentCode === ''){
      this.existingDepartmentCodeErrorInfo = 'Department code is required';
    }else if(this.existingDepartment.departmentCode.length < 2){
      this.existingDepartmentCodeErrorInfo = 'Department code should be minimum of 2 chars.';
    }else if(this.existingDepartment.departmentCode.length > 4){
      this.existingDepartmentCodeErrorInfo = 'Department code should not exceed 4 chars.';
    }
    else{
      this.existingDepartmentCodeErrorInfo = '';
    }
  }

  existingDepartmentLocationErrorInfo: string= '';
  validateExistingDepartmentLocation(){

  }

}
